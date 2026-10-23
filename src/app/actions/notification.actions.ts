'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { NotificationType } from '@prisma/client';

export async function getUserNotifications() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return { success: false, notifications: [], unreadCount: 0 };
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, name: true, createdAt: true },
    });

    if (!user) {
      return { success: false, notifications: [], unreadCount: 0 };
    }

    let notifications = await db.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 25,
    });

    // If user has no notifications yet, initialize welcoming notifications
    if (notifications.length === 0) {
      const welcome = await db.notification.create({
        data: {
          userId: user.id,
          title: 'Welcome to Calendio!',
          message: 'Your smart scheduling platform is live. Share your link to start receiving meetings.',
          type: NotificationType.IN_APP,
          isRead: false,
        },
      });

      const calSync = await db.notification.create({
        data: {
          userId: user.id,
          title: 'Conflict Prevention Active',
          message: 'Your Google Calendar connection is active. Calendio will automatically prevent double-bookings.',
          type: NotificationType.IN_APP,
          isRead: false,
        },
      });

      const mailjetSync = await db.notification.create({
        data: {
          userId: user.id,
          title: 'Email Delivery Ready',
          message: 'Mailjet REST API is configured to deliver instant booking confirmations and cancellation updates.',
          type: NotificationType.EMAIL,
          isRead: true,
        },
      });

      notifications = [welcome, calSync, mailjetSync];
    }

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return {
      success: true,
      notifications,
      unreadCount,
    };
  } catch (error: any) {
    console.error('getUserNotifications Error:', error);
    return { success: false, notifications: [], unreadCount: 0 };
  }
}

export async function markNotificationAsRead(id: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return { success: false };

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) return { success: false };

    await db.notification.updateMany({
      where: { id, userId: user.id },
      data: { isRead: true },
    });

    return { success: true };
  } catch (error: any) {
    console.error('markNotificationAsRead Error:', error);
    return { success: false };
  }
}

export async function markAllNotificationsAsRead() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return { success: false };

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) return { success: false };

    await db.notification.updateMany({
      where: { userId: user.id, isRead: false },
      data: { isRead: true },
    });

    return { success: true };
  } catch (error: any) {
    console.error('markAllNotificationsAsRead Error:', error);
    return { success: false };
  }
}

export async function clearNotification(id: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return { success: false };

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) return { success: false };

    await db.notification.deleteMany({
      where: { id, userId: user.id },
    });

    return { success: true };
  } catch (error: any) {
    console.error('clearNotification Error:', error);
    return { success: false };
  }
}
