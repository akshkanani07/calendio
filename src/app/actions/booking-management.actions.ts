'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { sendMailjetEmail } from '@/lib/mailjet';
import { executeAutomationsForTrigger } from '@/lib/workflow-engine';
import {
  getBookingCancelledEmailTemplate,
  getBookingRescheduledEmailTemplate,
} from '@/lib/email-templates';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

async function getAuthUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error('Unauthorized');

  const user = await db.user.findUnique({
    where: { email: session.user.email },
    include: { profile: true },
  });

  if (!user) throw new Error('User not found');
  return user;
}

// 1. GET ALL HOST BOOKINGS (Grouped for Upcoming, Past, Cancelled)
export async function getHostBookingsData() {
  try {
    const user = await getAuthUser();
    const now = new Date();

    const bookings = await db.booking.findMany({
      where: {
        hostId: user.id,
      },
      include: {
        eventType: true,
        host: {
          include: { profile: true },
        },
      },
      orderBy: {
        startTime: 'desc',
      },
    });

    const upcoming = bookings.filter(
      (b) => b.status !== 'CANCELLED' && new Date(b.startTime) >= now
    ).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

    const past = bookings.filter(
      (b) => b.status !== 'CANCELLED' && new Date(b.startTime) < now
    );

    const cancelled = bookings.filter((b) => b.status === 'CANCELLED');

    return {
      success: true,
      upcoming,
      past,
      cancelled,
      counts: {
        upcoming: upcoming.length,
        past: past.length,
        cancelled: cancelled.length,
      },
    };
  } catch (error: any) {
    console.error('getHostBookingsData Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch bookings',
      upcoming: [],
      past: [],
      cancelled: [],
      counts: { upcoming: 0, past: 0, cancelled: 0 },
    };
  }
}

// 2. CANCEL BOOKING WITH REASON & EMAIL NOTIFICATION
const CancelBookingSchema = z.object({
  bookingId: z.string().min(1),
  cancelReason: z.string().min(2, 'Please provide a cancellation reason.'),
});

export async function cancelBooking(data: z.infer<typeof CancelBookingSchema>) {
  try {
    const user = await getAuthUser();
    const { bookingId, cancelReason } = CancelBookingSchema.parse(data);

    // Verify ownership
    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: {
        eventType: true,
        host: {
          include: { profile: true },
        },
      },
    });

    if (!booking || booking.hostId !== user.id) {
      return { success: false, error: 'Booking not found or unauthorized.' };
    }

    if (booking.status === 'CANCELLED') {
      return { success: false, error: 'This booking is already cancelled.' };
    }

    // Update status in Database
    const updated = await db.booking.update({
      where: { id: bookingId },
      data: {
        status: 'CANCELLED',
        cancelReason: cancelReason.trim(),
      },
    });

    // Format human-readable date for email
    const formattedDateTime = booking.startTime.toLocaleString('en-US', {
      timeZone: booking.guestTimeZone,
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    const hostUsername = booking.host.profile?.username || 'user';
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const rebookUrl = `${baseUrl}/${hostUsername}/${booking.eventType.slug}`;

    // 1. Send Cancellation Email to GUEST
    const guestEmailContent = getBookingCancelledEmailTemplate({
      eventTitle: booking.eventType.title,
      hostName: booking.host.name || 'Calendio Host',
      guestName: booking.guestName,
      formattedDateTime,
      timeZone: booking.guestTimeZone,
      cancelReason: cancelReason.trim(),
      rebookUrl,
    });

    await sendMailjetEmail({
      toEmail: booking.guestEmail,
      toName: booking.guestName,
      subject: guestEmailContent.subject,
      html: guestEmailContent.html,
      text: guestEmailContent.text,
    });

    // 2. Send Cancellation Alert Email to HOST
    const hostEmailContent = getBookingCancelledEmailTemplate({
      eventTitle: booking.eventType.title,
      hostName: booking.host.name || 'Calendio Host',
      guestName: `${booking.guestName} (Guest: ${booking.guestEmail})`,
      formattedDateTime,
      timeZone: booking.guestTimeZone,
      cancelReason: cancelReason.trim(),
      rebookUrl: null,
    });

    await sendMailjetEmail({
      toEmail: user.email,
      toName: user.name || 'Host',
      subject: `Cancelled Confirmation: ${booking.eventType.title} with ${booking.guestName}`,
      html: hostEmailContent.html,
      text: hostEmailContent.text,
    });

    // Execute active BOOKING_CANCELLED workflows
    try {
      await executeAutomationsForTrigger({
        userId: user.id,
        eventTypeId: booking.eventTypeId,
        trigger: 'BOOKING_CANCELLED',
        data: {
          invitee_full_name: booking.guestName,
          invitee_first_name: booking.guestName.split(' ')[0],
          invitee_last_name: booking.guestName.split(' ').slice(1).join(' '),
          invitee_email: booking.guestEmail,
          host_name: booking.host.name || 'Calendio Host',
          host_email: booking.host.email,
          event_name: booking.eventType.title,
          event_date: formattedDateTime.split(' at ')[0] || formattedDateTime,
          event_time: formattedDateTime.split(' at ')[1] || formattedDateTime,
          event_description: booking.eventType.description || undefined,
          meeting_url: booking.meetingUrl || '',
          location: booking.eventType.locationType,
          questions_and_answers: 'Cancellation Reason: ' + cancelReason,
          cancel_link: '#',
          reschedule_link: (process.env.NEXTAUTH_URL || 'http://localhost:3000') + '/' + (booking.host.profile?.username || 'host') + '/' + booking.eventType.slug,
        },
      });
    } catch (wfErr) {
      console.error('Trigger BOOKING_CANCELLED workflows error:', wfErr);
    }

    // Create In-App Notification
    try {
      await db.notification.create({
        data: {
          userId: user.id,
          title: 'Booking Cancelled',
          message: booking.guestName + ' cancelled "' + booking.eventType.title + '" scheduled for ' + formattedDateTime + '.',
          type: 'IN_APP',
        },
      });
    } catch (notifErr) {
      console.error('Notification error:', notifErr);
    }

    revalidatePath('/bookings');
    revalidatePath('/dashboard');

    return {
      success: true,
      message: 'Meeting cancelled successfully. Cancellation email notifications sent.',
    };
  } catch (error: any) {
    console.error('cancelBooking Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to cancel booking. Please try again.',
    };
  }
}

// 3. RESCHEDULE BOOKING WITH UPDATED TIMES & EMAIL NOTIFICATION
const RescheduleBookingSchema = z.object({
  bookingId: z.string().min(1),
  newIsoStart: z.string().min(1),
  newIsoEnd: z.string().min(1),
  rescheduleReason: z.string().optional(),
});

export async function rescheduleBooking(data: z.infer<typeof RescheduleBookingSchema>) {
  try {
    const user = await getAuthUser();
    const { bookingId, newIsoStart, newIsoEnd, rescheduleReason } =
      RescheduleBookingSchema.parse(data);

    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: {
        eventType: true,
        host: {
          include: { profile: true },
        },
      },
    });

    if (!booking || booking.hostId !== user.id) {
      return { success: false, error: 'Booking not found or unauthorized.' };
    }

    const newStartTime = new Date(newIsoStart);
    const newEndTime = new Date(newIsoEnd);

    // Concurrency collision check
    const overlap = await db.booking.findFirst({
      where: {
        id: { not: bookingId },
        hostId: user.id,
        status: { not: 'CANCELLED' },
        startTime: { lt: newEndTime },
        endTime: { gt: newStartTime },
      },
    });

    if (overlap) {
      return {
        success: false,
        error: 'The newly selected time slot is already booked. Please choose another time.',
      };
    }

    // Update booking in DB
    const updated = await db.booking.update({
      where: { id: bookingId },
      data: {
        startTime: newStartTime,
        endTime: newEndTime,
        status: 'RESCHEDULED',
        guestNotes: rescheduleReason
          ? `${booking.guestNotes ? booking.guestNotes + '\n' : ''}[Rescheduled Note]: ${rescheduleReason}`
          : booking.guestNotes,
      },
    });

    const newFormattedDateTime = newStartTime.toLocaleString('en-US', {
      timeZone: booking.guestTimeZone,
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    // Send Reschedule Email to Guest
    const guestEmailContent = getBookingRescheduledEmailTemplate({
      eventTitle: booking.eventType.title,
      hostName: booking.host.name || 'Calendio Host',
      guestName: booking.guestName,
      newFormattedDateTime,
      timeZone: booking.guestTimeZone,
      meetingUrl: booking.meetingUrl,
      rescheduleReason,
    });

    await sendMailjetEmail({
      toEmail: booking.guestEmail,
      toName: booking.guestName,
      subject: guestEmailContent.subject,
      html: guestEmailContent.html,
      text: guestEmailContent.text,
    });

    // Send Reschedule Email to Host
    await sendMailjetEmail({
      toEmail: user.email,
      toName: user.name || 'Host',
      subject: `Rescheduled: ${booking.eventType.title} with ${booking.guestName}`,
      html: guestEmailContent.html,
      text: guestEmailContent.text,
    });

    // Execute active BOOKING_RESCHEDULED workflows
    try {
      await executeAutomationsForTrigger({
        userId: user.id,
        eventTypeId: booking.eventTypeId,
        trigger: 'BOOKING_RESCHEDULED',
        data: {
          invitee_full_name: booking.guestName,
          invitee_first_name: booking.guestName.split(' ')[0],
          invitee_last_name: booking.guestName.split(' ').slice(1).join(' '),
          invitee_email: booking.guestEmail,
          host_name: booking.host.name || 'Calendio Host',
          host_email: booking.host.email,
          event_name: booking.eventType.title,
          event_date: newFormattedDateTime.split(' at ')[0] || newFormattedDateTime,
          event_time: newFormattedDateTime.split(' at ')[1] || newFormattedDateTime,
          event_description: booking.eventType.description || undefined,
          meeting_url: booking.meetingUrl || '',
          location: booking.eventType.locationType,
          questions_and_answers: 'Reschedule Reason: ' + (rescheduleReason || 'None'),
          cancel_link: (process.env.NEXTAUTH_URL || 'http://localhost:3000') + '/bookings',
          reschedule_link: (process.env.NEXTAUTH_URL || 'http://localhost:3000') + '/' + (booking.host.profile?.username || 'host') + '/' + booking.eventType.slug,
        },
      });
    } catch (wfErr) {
      console.error('Trigger BOOKING_RESCHEDULED workflows error:', wfErr);
    }

    revalidatePath('/bookings');
    revalidatePath('/dashboard');

    return {
      success: true,
      message: 'Meeting rescheduled successfully and updated invitations sent.',
    };
  } catch (error: any) {
    console.error('rescheduleBooking Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to reschedule booking.',
    };
  }
}
