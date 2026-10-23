'use server';

import { db } from '@/lib/db';
import { sendMailjetEmail } from '@/lib/mailjet';
import { executeAutomationsForTrigger } from '@/lib/workflow-engine';
import {
  getBookingConfirmationEmailTemplate,
  getHostBookingNotificationTemplate,
} from '@/lib/email-templates';
import { generateMeetingSession } from '@/lib/meeting-providers';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

function generateGoogleMeetSlug() {
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  const part = (len: number) =>
    Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `https://meet.google.com/${part(3)}-${part(4)}-${part(3)}`;
}

// 1. GET PUBLIC USER DETAILS & THEIR EVENT TYPES
export async function getPublicUserByUsername(username: string) {
  try {
    const profile = await db.profile.findUnique({
      where: { username },
      include: {
        user: {
          include: {
            eventTypes: {
              where: {
                isActive: true,
                isPrivate: false,
              },
              orderBy: { createdAt: 'asc' },
            },
          },
        },
      },
    });

    if (!profile || !profile.user) {
      return null;
    }

    return {
      userId: profile.user.id,
      name: profile.user.name,
      email: profile.user.email,
      image: profile.user.image,
      timeZone: profile.user.timeZone,
      username: profile.username,
      bio: profile.bio,
      company: profile.company,
      brandColor: profile.brandColor,
      eventTypes: profile.user.eventTypes,
    };
  } catch (error) {
    console.error('getPublicUserByUsername Error:', error);
    return null;
  }
}

// 2. GET PUBLIC EVENT DETAILS
export async function getPublicEventDetails(username: string, eventSlug: string) {
  try {
    const profile = await db.profile.findUnique({
      where: { username },
      include: {
        user: true,
      },
    });

    if (!profile || !profile.user) return null;

    const eventType = await db.eventType.findFirst({
      where: {
        userId: profile.user.id,
        slug: eventSlug,
        isActive: true,
      },
    });

    if (!eventType) return null;

    return {
      eventType,
      host: {
        id: profile.user.id,
        name: profile.user.name,
        email: profile.user.email,
        image: profile.user.image,
        timeZone: profile.user.timeZone,
        username: profile.username,
        bio: profile.bio,
        company: profile.company,
        brandColor: profile.brandColor,
      },
    };
  } catch (error) {
    console.error('getPublicEventDetails Error:', error);
    return null;
  }
}

// 3. GET AVAILABLE SLOTS FOR A SPECIFIC DATE
export async function getAvailableSlotsForDate({
  hostId,
  eventDuration = 30,
  dateStr,
}: {
  hostId: string;
  eventDuration?: number;
  dateStr: string;
}) {
  try {
    // Parse target date (YYYY-MM-DD)
    const [y, m, d] = dateStr.split('-').map(Number);
    const targetDate = new Date(Date.UTC(y, m - 1, d, 0, 0, 0));
    const dayOfWeek = targetDate.getUTCDay(); // 0 = Sun, 1 = Mon ... 6 = Sat

    // Fetch Host Availability & Date Override
    const [availabilities, overrides] = await Promise.all([
      db.availability.findMany({ where: { userId: hostId } }),
      db.dateOverride.findMany({ where: { userId: hostId } }),
    ]);

    // Check specific Date Override first
    const dateOverride = overrides.find((o) => {
      const oDate = new Date(o.date);
      return (
        oDate.getUTCFullYear() === y &&
        oDate.getUTCMonth() === m - 1 &&
        oDate.getUTCDate() === d
      );
    });

    if (dateOverride?.isBlocked) {
      return { success: true, slots: [] }; // Day is blocked
    }

    // Check Weekly Schedule
    const daySchedule = availabilities.find((a) => a.dayOfWeek === dayOfWeek);
    const isDayAvailable = daySchedule ? daySchedule.isAvailable : dayOfWeek >= 1 && dayOfWeek <= 5;

    if (!isDayAvailable) {
      return { success: true, slots: [] }; // Not a working day
    }

    const startTimeStr = dateOverride?.startTime || daySchedule?.startTime || '09:00';
    const endTimeStr = dateOverride?.endTime || daySchedule?.endTime || '17:00';
    const bufferBeforeMin = daySchedule?.bufferBeforeMin || 0;
    const bufferAfterMin = daySchedule?.bufferAfterMin || 15;
    const minNoticeHours = daySchedule?.minNoticeHours || 2;
    const maxBookingsPerDay = daySchedule?.maxBookingsPerDay || null;

    // Fetch existing confirmed bookings for that date
    const dayStart = new Date(Date.UTC(y, m - 1, d, 0, 0, 0));
    const dayEnd = new Date(Date.UTC(y, m - 1, d, 23, 59, 59, 999));

    const existingBookings = await db.booking.findMany({
      where: {
        hostId,
        status: { not: 'CANCELLED' },
        startTime: { gte: dayStart, lte: dayEnd },
      },
    });

    if (maxBookingsPerDay && existingBookings.length >= maxBookingsPerDay) {
      return { success: true, slots: [] }; // Max bookings reached
    }

    // Generate potential slots
    const [startH, startM] = startTimeStr.split(':').map(Number);
    const [endH, endM] = endTimeStr.split(':').map(Number);

    let curMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    const now = new Date();
    const minNoticeTime = new Date(now.getTime() + minNoticeHours * 60 * 60 * 1000);

    const availableSlots: {
      time: string;
      formatted: string;
      isoStart: string;
      isoEnd: string;
      startTime?: string;
      endTime?: string;
    }[] = [];

    // Step by eventDuration or 30 mins
    const step = eventDuration <= 30 ? 30 : 30;

    while (curMinutes + eventDuration <= endMinutes) {
      const slotHour = Math.floor(curMinutes / 60);
      const slotMin = curMinutes % 60;

      const slotStart = new Date(Date.UTC(y, m - 1, d, slotHour, slotMin, 0));
      const slotEnd = new Date(slotStart.getTime() + eventDuration * 60 * 1000);

      // Check minimum notice requirement
      if (slotStart > minNoticeTime) {
        // Check collision with existing bookings + buffer
        const slotStartWithBuffer = slotStart.getTime() - bufferBeforeMin * 60 * 1000;
        const slotEndWithBuffer = slotEnd.getTime() + bufferAfterMin * 60 * 1000;

        let hasOverlap = false;
        for (const booking of existingBookings) {
          const bStart = booking.startTime.getTime();
          const bEnd = booking.endTime.getTime();

          if (Math.max(slotStartWithBuffer, bStart) < Math.min(slotEndWithBuffer, bEnd)) {
            hasOverlap = true;
            break;
          }
        }

        if (!hasOverlap) {
          const timeStr = `${String(slotHour).padStart(2, '0')}:${String(slotMin).padStart(2, '0')}`;
          const period = slotHour >= 12 ? 'PM' : 'AM';
          const displayHour = slotHour % 12 === 0 ? 12 : slotHour % 12;
          const formatted = `${displayHour}:${String(slotMin).padStart(2, '0')} ${period}`;

          availableSlots.push({
            time: timeStr,
            formatted,
            isoStart: slotStart.toISOString(),
            isoEnd: slotEnd.toISOString(),
            startTime: slotStart.toISOString(),
            endTime: slotEnd.toISOString(),
          });
        }
      }

      curMinutes += step;
    }

    return { success: true, slots: availableSlots };
  } catch (error: any) {
    console.error('getAvailableSlotsForDate Error:', error);
    return { success: false, error: error.message || 'Failed to fetch slots', slots: [] };
  }
}

// 4. CREATE PUBLIC BOOKING
const BookingCreateSchema = z.object({
  hostId: z.string().min(1),
  eventTypeId: z.string().min(1),
  guestName: z.string().min(2, 'Please enter your full name.'),
  guestEmail: z.string().email('Please enter a valid email address.'),
  guestNotes: z.string().optional(),
  guestTimeZone: z.string().default('Asia/Kolkata'),
  isoStart: z.string().min(1),
  isoEnd: z.string().min(1),
  answers: z.record(z.any()).optional(),
  additionalGuests: z.array(z.string().email()).optional(),
});

export async function createPublicBooking(data: z.infer<typeof BookingCreateSchema>) {
  try {
    const validated = BookingCreateSchema.parse(data);

    // Fetch Host & EventType
    const [host, eventType] = await Promise.all([
      db.user.findUnique({ where: { id: validated.hostId } }),
      db.eventType.findUnique({ where: { id: validated.eventTypeId } }),
    ]);

    if (!host || !eventType) {
      return { success: false, error: 'Host or Event Type not found.' };
    }

    const startTime = new Date(validated.isoStart);
    const endTime = new Date(validated.isoEnd);

    // Concurrency Check: Check if slot was booked just now
    const overlap = await db.booking.findFirst({
      where: {
        hostId: validated.hostId,
        status: { not: 'CANCELLED' },
        startTime: { lt: endTime },
        endTime: { gt: startTime },
      },
    });

    if (overlap) {
      return {
        success: false,
        error: 'This time slot was just booked by someone else. Please pick another time.',
      };
    }

    // Generate authentic conferencing meeting link according to provider (Zoom, Google Meet, Teams, Webex, Whereby, etc.)
    const meetingSession = generateMeetingSession({
      provider: eventType.locationType,
      hostName: host.name || 'Calendio Host',
      hostSlug: host.name?.toLowerCase().replace(/\s+/g, '-') || 'host',
      eventTitle: eventType.title,
      customUrl: eventType.locationUrl,
      guestPhone: (validated.answers as any)?.phone || validated.guestNotes,
    });

    const meetingUrl = meetingSession.meetingUrl;

    // Create Booking and Meeting in Transaction
    const booking = await (db as any).$transaction(async (tx: any) => {
      const createdBooking = await tx.booking.create({
        data: {
          eventTypeId: eventType.id,
          hostId: host.id,
          guestName: validated.guestName,
          guestEmail: validated.guestEmail.toLowerCase().trim(),
          guestNotes: validated.guestNotes || null,
          guestTimeZone: validated.guestTimeZone,
          customResponses: validated.answers || null,
          startTime,
          endTime,
          meetingUrl,
          locationType: eventType.locationType as any,
          locationDetails: meetingSession.locationDetails as any,
          status: 'CONFIRMED',
        },
      });

      // Automatically create a linked Meeting
      await tx.meeting.create({
        data: {
          bookingId: createdBooking.id,
          hostId: host.id,
          internalNotes: validated.guestNotes || null,
        },
      });

      // Optionally create or update a Contact in CRM
      try {
        await tx.contact.upsert({
          where: {
            userId_email: {
              userId: host.id,
              email: validated.guestEmail.toLowerCase().trim(),
            },
          },
          update: {
            name: validated.guestName,
            totalBookings: { increment: 1 },
            lastBookedAt: new Date(),
          },
          create: {
            userId: host.id,
            name: validated.guestName,
            email: validated.guestEmail.toLowerCase().trim(),
            totalBookings: 1,
            lastBookedAt: new Date(),
          },
        });
      } catch (crmErr) {
        // Graceful non-blocking
      }

      return createdBooking;
    });

    // Format human-readable date & time for email notifications
    const formattedDateTime = startTime.toLocaleString('en-US', {
      timeZone: validated.guestTimeZone,
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    // Send Confirmation Email to Guest
    const guestEmailContent = getBookingConfirmationEmailTemplate({
      guestName: validated.guestName,
      hostName: host.name || 'Calendio Host',
      eventTitle: eventType.title,
      formattedDateTime,
      timeZone: validated.guestTimeZone,
      meetingUrl,
      locationType: eventType.locationType,
      locationDetails: meetingSession.locationDetails,
      notes: validated.guestNotes,
    });

    await sendMailjetEmail({
      toEmail: validated.guestEmail,
      toName: validated.guestName,
      subject: guestEmailContent.subject,
      html: guestEmailContent.html,
      text: guestEmailContent.text,
    });

    // Send Alert Email to Host
    const hostEmailContent = getHostBookingNotificationTemplate({
      hostName: host.name || 'Host',
      guestName: validated.guestName,
      guestEmail: validated.guestEmail,
      eventTitle: eventType.title,
      formattedDateTime,
      timeZone: validated.guestTimeZone,
      meetingUrl,
      locationType: eventType.locationType,
      locationDetails: meetingSession.locationDetails,
      notes: validated.guestNotes,
    });

    await sendMailjetEmail({
      toEmail: host.email,
      toName: host.name || 'Host',
      subject: hostEmailContent.subject,
      html: hostEmailContent.html,
      text: hostEmailContent.text,
    });

    // Execute active BOOKING_CREATED workflows
    try {
      await executeAutomationsForTrigger({
        userId: host.id,
        eventTypeId: eventType.id,
        trigger: 'BOOKING_CREATED',
        data: {
          invitee_full_name: validated.guestName,
          invitee_first_name: validated.guestName.split(' ')[0],
          invitee_last_name: validated.guestName.split(' ').slice(1).join(' '),
          invitee_email: validated.guestEmail,
          host_name: host.name || 'Calendio Host',
          host_email: host.email,
          event_name: eventType.title,
          event_date: formattedDateTime.split(' at ')[0] || formattedDateTime,
          event_time: formattedDateTime.split(' at ')[1] || formattedDateTime,
          event_description: eventType.description || undefined,
          meeting_url: meetingUrl || '',
          location: eventType.locationType,
          questions_and_answers: validated.guestNotes || 'None',
          cancel_link: (process.env.NEXTAUTH_URL || 'http://localhost:3000') + '/bookings',
          reschedule_link: (process.env.NEXTAUTH_URL || 'http://localhost:3000') + '/' + (host.name?.toLowerCase().replace(/\s+/g, '-') || 'host') + '/' + eventType.slug,
        },
      });
    } catch (wfErr) {
      console.error('Trigger BOOKING_CREATED workflows error:', wfErr);
    }

    // Auto-Capture / Update Contact in CRM
    try {
      await db.contact.upsert({
        where: {
          userId_email: {
            userId: host.id,
            email: validated.guestEmail.toLowerCase().trim(),
          },
        },
        update: {
          name: validated.guestName,
          totalBookings: { increment: 1 },
          lastMeetingAt: startTime,
        },
        create: {
          userId: host.id,
          name: validated.guestName,
          email: validated.guestEmail.toLowerCase().trim(),
          totalBookings: 1,
          lastMeetingAt: startTime,
          tags: ['Lead'],
        },
      });
    } catch (crmErr) {
      console.error('CRM Auto-Capture Error:', crmErr);
    }

    // Create In-App Notification
    try {
      await db.notification.create({
        data: {
          userId: host.id,
          title: 'New Booking Scheduled',
          message: validated.guestName + ' booked "' + eventType.title + '" for ' + formattedDateTime + '.',
          type: 'IN_APP',
        },
      });
    } catch (notifErr) {
      console.error('Notification error:', notifErr);
    }

    revalidatePath('/contacts');
    revalidatePath('/bookings');
    revalidatePath('/dashboard');

    return {
      success: true,
      uid: booking.uid,
    };
  } catch (error: any) {
    console.error('createPublicBooking Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to complete booking. Please try again.',
    };
  }
}

// 5. GET BOOKING BY PUBLIC UID (For Confirmation Page)
export async function getBookingByUid(uid: string) {
  try {
    const booking = await db.booking.findUnique({
      where: { uid },
      include: {
        eventType: true,
        host: {
          include: { profile: true },
        },
      },
    });

    return booking;
  } catch (error) {
    console.error('getBookingByUid Error:', error);
    return null;
  }
}
