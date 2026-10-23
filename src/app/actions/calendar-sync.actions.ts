'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { IntegrationType } from '@prisma/client';
import crypto from 'crypto';

export interface ConnectCalendarInput {
  provider: IntegrationType;
  accountEmail: string;
}

export async function getUserCalendarSyncData() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return { success: false, error: 'Unauthorized', calendars: [], integrations: [], webhooks: [] };
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      include: {
        calendars: {
          orderBy: { createdAt: 'desc' },
        },
        integrations: true,
        webhooks: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user) {
      return { success: false, error: 'User not found', calendars: [], integrations: [], webhooks: [] };
    }

    // If user has no calendars yet, auto-create a default Google Calendar connection using their account email
    let userCalendars = user.calendars;
    if (userCalendars.length === 0) {
      const defaultCal = await db.calendar.create({
        data: {
          userId: user.id,
          provider: IntegrationType.GOOGLE_CALENDAR,
          accountEmail: user.email,
          accessToken: 'calendio_oauth_token_' + crypto.randomBytes(8).toString('hex'),
          isPrimary: true,
          checkConflicts: true,
        },
      });
      userCalendars = [defaultCal];
    }

    // Default integrations: Ensure GOOGLE_MEET is initialized
    let userIntegrations = user.integrations;
    const hasGoogleMeet = userIntegrations.some((i) => i.type === IntegrationType.GOOGLE_MEET);
    if (!hasGoogleMeet) {
      const gMeet = await db.integration.create({
        data: {
          userId: user.id,
          type: IntegrationType.GOOGLE_MEET,
          credentials: { mode: 'instant', autoGenerateUrl: true },
          isConnected: true,
        },
      });
      userIntegrations = [...userIntegrations, gMeet];
    }

    return {
      success: true,
      userId: user.id,
      userEmail: user.email,
      calendars: userCalendars,
      integrations: userIntegrations,
      webhooks: user.webhooks,
    };
  } catch (error: any) {
    console.error('getUserCalendarSyncData Error:', error);
    return { success: false, error: error.message, calendars: [], integrations: [], webhooks: [] };
  }
}

export async function connectCalendarAccount(data: ConnectCalendarInput) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return { success: false, error: 'Unauthorized' };
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    // Check if this provider + email already exists for user
    const existing = await db.calendar.findFirst({
      where: {
        userId: user.id,
        provider: data.provider,
        accountEmail: data.accountEmail.toLowerCase().trim(),
      },
    });

    if (existing) {
      return { success: false, error: 'This calendar account is already connected.' };
    }

    const count = await db.calendar.count({ where: { userId: user.id } });

    await db.calendar.create({
      data: {
        userId: user.id,
        provider: data.provider,
        accountEmail: data.accountEmail.toLowerCase().trim(),
        accessToken: 'oauth_' + crypto.randomBytes(16).toString('hex'),
        refreshToken: 'refresh_' + crypto.randomBytes(16).toString('hex'),
        checkConflicts: true,
        isPrimary: count === 0, // First calendar is primary
      },
    });

    revalidatePath('/calendar');
    return { success: true };
  } catch (error: any) {
    console.error('connectCalendarAccount Error:', error);
    return { success: false, error: error.message || 'Failed to connect calendar' };
  }
}

export async function toggleCheckConflicts(calendarId: string, checkConflicts: boolean) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return { success: false, error: 'Unauthorized' };
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    await db.calendar.updateMany({
      where: { id: calendarId, userId: user.id },
      data: { checkConflicts },
    });

    revalidatePath('/calendar');
    return { success: true };
  } catch (error: any) {
    console.error('toggleCheckConflicts Error:', error);
    return { success: false, error: error.message };
  }
}

export async function setPrimaryCalendar(calendarId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return { success: false, error: 'Unauthorized' };
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    // Set all user calendars isPrimary: false
    await db.calendar.updateMany({
      where: { userId: user.id },
      data: { isPrimary: false },
    });

    // Set targeted calendar isPrimary: true
    await db.calendar.updateMany({
      where: { id: calendarId, userId: user.id },
      data: { isPrimary: true },
    });

    revalidatePath('/calendar');
    return { success: true };
  } catch (error: any) {
    console.error('setPrimaryCalendar Error:', error);
    return { success: false, error: error.message };
  }
}

export async function disconnectCalendar(calendarId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return { success: false, error: 'Unauthorized' };
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    // Check count: prevent disconnecting if only 1 calendar remains
    const total = await db.calendar.count({ where: { userId: user.id } });
    if (total <= 1) {
      return { success: false, error: 'You must have at least one active calendar connection to check scheduling conflicts.' };
    }

    const target = await db.calendar.findFirst({
      where: { id: calendarId, userId: user.id },
    });

    await db.calendar.deleteMany({
      where: { id: calendarId, userId: user.id },
    });

    // If was primary, elect the first remaining one as primary
    if (target?.isPrimary) {
      const remaining = await db.calendar.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: 'asc' },
      });
      if (remaining) {
        await db.calendar.update({
          where: { id: remaining.id },
          data: { isPrimary: true },
        });
      }
    }

    revalidatePath('/calendar');
    return { success: true };
  } catch (error: any) {
    console.error('disconnectCalendar Error:', error);
    return { success: false, error: error.message };
  }
}

export async function toggleIntegration(type: IntegrationType, isConnected: boolean, credentials?: any) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return { success: false, error: 'Unauthorized' };
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    await db.integration.upsert({
      where: {
        userId_type: {
          userId: user.id,
          type,
        },
      },
      update: {
        isConnected,
        credentials: credentials || {},
      },
      create: {
        userId: user.id,
        type,
        isConnected,
        credentials: credentials || {},
      },
    });

    revalidatePath('/calendar');
    return { success: true };
  } catch (error: any) {
    console.error('toggleIntegration Error:', error);
    return { success: false, error: error.message };
  }
}

export async function createWebhook(data: { name: string; url: string; events: string[] }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return { success: false, error: 'Unauthorized' };
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    const secret = 'whsec_' + crypto.randomBytes(24).toString('hex');

    const webhook = await db.webhook.create({
      data: {
        userId: user.id,
        name: data.name.trim(),
        url: data.url.trim(),
        secret,
        events: data.events.length > 0 ? data.events : ['booking.created', 'booking.cancelled'],
        isActive: true,
      },
    });

    revalidatePath('/calendar');
    return { success: true, data: webhook };
  } catch (error: any) {
    console.error('createWebhook Error:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteWebhook(id: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return { success: false, error: 'Unauthorized' };
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    await db.webhook.deleteMany({
      where: { id, userId: user.id },
    });

    revalidatePath('/calendar');
    return { success: true };
  } catch (error: any) {
    console.error('deleteWebhook Error:', error);
    return { success: false, error: error.message };
  }
}

export async function testWebhook(webhookId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return { success: false, error: 'Unauthorized' };
    }

    const webhook = await db.webhook.findUnique({
      where: { id: webhookId },
    });

    if (!webhook) {
      return { success: false, error: 'Webhook not found' };
    }

    const testPayload = {
      event: 'booking.created',
      timestamp: new Date().toISOString(),
      data: {
        bookingId: 'test_bk_' + crypto.randomBytes(6).toString('hex'),
        hostEmail: session.user.email,
        guestName: 'Jane Doe',
        guestEmail: 'jane.doe@example.com',
        eventType: '30 Minute Strategy Consultation',
        startTime: new Date(Date.now() + 86400000).toISOString(),
        meetingUrl: 'https://meet.google.com/abc-test-meet',
      },
    };

    const startTime = Date.now();
    try {
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Calendio-Signature': crypto
            .createHmac('sha256', webhook.secret)
            .update(JSON.stringify(testPayload))
            .digest('hex'),
        },
        body: JSON.stringify(testPayload),
        signal: AbortSignal.timeout(6000), // 6s timeout
      });

      const responseTime = Date.now() - startTime;

      await db.webhook.update({
        where: { id: webhookId },
        data: { lastTriggeredAt: new Date() },
      });

      return {
        success: true,
        statusCode: response.status,
        responseTimeMs: responseTime,
        message: `HTTP ${response.status} (${responseTime}ms)`,
      };
    } catch (networkErr: any) {
      return {
        success: false,
        error: `Could not reach endpoint: ${networkErr.message}`,
      };
    }
  } catch (error: any) {
    console.error('testWebhook Error:', error);
    return { success: false, error: error.message };
  }
}
