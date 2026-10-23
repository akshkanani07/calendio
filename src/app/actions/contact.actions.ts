'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { sendMailjetEmail } from '@/lib/mailjet';

export interface CreateContactInput {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  tags?: string[];
  notes?: string;
}

export interface UpdateContactInput {
  name?: string;
  phone?: string;
  company?: string;
  tags?: string[];
  notes?: string;
}

export async function getUserContacts() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return { success: false, error: 'Unauthorized', data: [] };
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return { success: false, error: 'User not found', data: [] };
    }

    const contacts = await db.contact.findMany({
      where: { userId: user.id },
      orderBy: [{ lastMeetingAt: 'desc' }, { createdAt: 'desc' }],
    });

    return { success: true, data: contacts };
  } catch (error: any) {
    console.error('getUserContacts Error:', error);
    return { success: false, error: error.message || 'Failed to fetch contacts', data: [] };
  }
}

export async function getContactDetails(contactId: string) {
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

    const contact = await db.contact.findFirst({
      where: { id: contactId, userId: user.id },
    });

    if (!contact) {
      return { success: false, error: 'Contact not found' };
    }

    // Fetch all bookings for this contact with the host
    const bookings = await db.booking.findMany({
      where: {
        hostId: user.id,
        guestEmail: contact.email.toLowerCase().trim(),
      },
      include: {
        eventType: {
          select: {
            id: true,
            title: true,
            duration: true,
            slug: true,
            color: true,
            locationType: true,
          },
        },
      },
      orderBy: { startTime: 'desc' },
    });

    return {
      success: true,
      data: {
        contact,
        bookings,
      },
    };
  } catch (error: any) {
    console.error('getContactDetails Error:', error);
    return { success: false, error: error.message || 'Failed to fetch contact details' };
  }
}

export async function createContact(data: CreateContactInput) {
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

    const emailClean = data.email.toLowerCase().trim();

    // Check if contact already exists
    const existing = await db.contact.findUnique({
      where: {
        userId_email: {
          userId: user.id,
          email: emailClean,
        },
      },
    });

    if (existing) {
      return { success: false, error: 'A contact with this email address already exists.' };
    }

    const newContact = await db.contact.create({
      data: {
        userId: user.id,
        name: data.name.trim(),
        email: emailClean,
        phone: data.phone?.trim() || null,
        company: data.company?.trim() || null,
        tags: data.tags || ['Lead'],
        notes: data.notes?.trim() || null,
        totalBookings: 0,
      },
    });

    revalidatePath('/contacts');
    return { success: true, data: newContact };
  } catch (error: any) {
    console.error('createContact Error:', error);
    return { success: false, error: error.message || 'Failed to create contact' };
  }
}

export async function updateContact(contactId: string, data: UpdateContactInput) {
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

    // Verify ownership
    const existing = await db.contact.findFirst({
      where: { id: contactId, userId: user.id },
    });

    if (!existing) {
      return { success: false, error: 'Contact not found or access denied.' };
    }

    const updated = await db.contact.update({
      where: { id: contactId },
      data: {
        name: data.name !== undefined ? data.name.trim() : existing.name,
        phone: data.phone !== undefined ? (data.phone.trim() || null) : existing.phone,
        company: data.company !== undefined ? (data.company.trim() || null) : existing.company,
        tags: data.tags !== undefined ? data.tags : existing.tags,
        notes: data.notes !== undefined ? (data.notes.trim() || null) : existing.notes,
      },
    });

    revalidatePath('/contacts');
    return { success: true, data: updated };
  } catch (error: any) {
    console.error('updateContact Error:', error);
    return { success: false, error: error.message || 'Failed to update contact' };
  }
}

export async function deleteContact(contactId: string) {
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

    await db.contact.deleteMany({
      where: { id: contactId, userId: user.id },
    });

    revalidatePath('/contacts');
    return { success: true };
  } catch (error: any) {
    console.error('deleteContact Error:', error);
    return { success: false, error: error.message || 'Failed to delete contact' };
  }
}

/**
 * Scans all bookings of the user and automatically creates or updates CRM contacts
 */
export async function syncContactsFromBookings() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return { success: false, error: 'Unauthorized', count: 0 };
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return { success: false, error: 'User not found', count: 0 };
    }

    // Fetch all bookings for this host
    const bookings = await db.booking.findMany({
      where: { hostId: user.id },
      orderBy: { startTime: 'asc' },
    });

    if (bookings.length === 0) {
      return { success: true, count: 0, message: 'No bookings found to sync.' };
    }

    // Group by guestEmail
    const guestMap = new Map<string, { name: string; email: string; count: number; lastMeeting: Date }>();

    for (const b of bookings) {
      const email = b.guestEmail.toLowerCase().trim();
      const existing = guestMap.get(email);
      if (existing) {
        existing.count++;
        if (new Date(b.startTime) > existing.lastMeeting) {
          existing.lastMeeting = new Date(b.startTime);
          existing.name = b.guestName;
        }
      } else {
        guestMap.set(email, {
          name: b.guestName,
          email,
          count: 1,
          lastMeeting: new Date(b.startTime),
        });
      }
    }

    let syncedCount = 0;

    for (const [email, info] of guestMap.entries()) {
      await db.contact.upsert({
        where: {
          userId_email: {
            userId: user.id,
            email,
          },
        },
        update: {
          name: info.name,
          totalBookings: info.count,
          lastMeetingAt: info.lastMeeting,
        },
        create: {
          userId: user.id,
          name: info.name,
          email,
          totalBookings: info.count,
          lastMeetingAt: info.lastMeeting,
          tags: info.count > 1 ? ['Client', 'Repeat'] : ['Lead'],
        },
      });
      syncedCount++;
    }

    revalidatePath('/contacts');
    return {
      success: true,
      count: syncedCount,
      message: `Successfully synced ${syncedCount} contact${syncedCount === 1 ? '' : 's'} from your scheduled bookings!`,
    };
  } catch (error: any) {
    console.error('syncContactsFromBookings Error:', error);
    return { success: false, error: error.message || 'Failed to sync contacts', count: 0 };
  }
}

/**
 * Sends a direct personalized email to a contact via Mailjet
 */
export async function sendEmailToContact({
  contactEmail,
  contactName,
  subject,
  message,
}: {
  contactEmail: string;
  contactName: string;
  subject: string;
  message: string;
}) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return { success: false, error: 'Unauthorized' };
    }

    const hostName = session.user.name || 'Calendio Host';

    const formattedBody = message
      .split('\n\n')
      .map((para) => `<p style="margin: 0 0 16px 0; line-height: 1.6; color: #334155;">${para.replace(/\n/g, '<br/>')}</p>`)
      .join('');

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);">
          <tr>
            <td style="background: linear-gradient(135deg, #0069ff 0%, #004ecc 100%); padding: 24px 32px;">
              <span style="color: #ffffff; font-size: 20px; font-weight: 800;">Calendio</span>
              <span style="color: rgba(255, 255, 255, 0.85); font-size: 13px; margin-left: 8px;">Direct Message</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 36px 32px 28px 32px; font-size: 15px; color: #1e293b;">
              ${formattedBody}
            </td>
          </tr>
          <tr>
            <td style="background-color: #f8fafc; padding: 18px 32px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #94a3b8;">
              Sent by ${hostName} (${session.user.email}) via Calendio CRM.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();

    await sendMailjetEmail({
      toEmail: contactEmail,
      toName: contactName,
      subject,
      html,
      text: message,
    });

    return { success: true };
  } catch (error: any) {
    console.error('sendEmailToContact Error:', error);
    return { success: false, error: error.message || 'Failed to send message' };
  }
}
