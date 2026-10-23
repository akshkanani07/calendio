import React from 'react';
import { notFound } from 'next/navigation';
import { getBookingByUid } from '@/app/actions/booking.actions';
import { db } from '@/lib/db';
import {
  getGoogleCalendarUrl,
  getOutlookCalendarUrl,
  getOffice365CalendarUrl,
} from '@/lib/calendar-export';
import { ConfirmationView } from '@/components/booking/confirmation-view';
import { formatLocationForCalendar, formatInstructionsForCalendar } from '@/lib/meeting-providers';

export default async function BookingConfirmationPage({
  params,
  searchParams,
}: {
  params: Promise<{ username: string; eventSlug: string }>;
  searchParams: Promise<{ uid?: string; bookingId?: string }>;
}) {
  const { username, eventSlug } = await params;
  const sParams = await searchParams;
  const token = sParams.uid || sParams.bookingId;

  if (!token) return notFound();

  let booking = await getBookingByUid(token);
  if (!booking) {
    booking = await db.booking.findUnique({
      where: { id: token },
      include: {
        eventType: true,
        host: {
          include: { profile: true },
        },
      },
    });
  }

  if (!booking) return notFound();

  const { eventType, host } = booking;
  const locType = (booking as any).locationType || eventType.locationType || 'GOOGLE_MEET';
  const locDetails = (booking as any).locationDetails || null;

  const meetingTitle = `${eventType.title} with ${host.name || 'Calendio Host'}`;

  const formattedLocation = formatLocationForCalendar(locType, booking.meetingUrl, locDetails);
  const formattedDescription = formatInstructionsForCalendar({
    locationType: locType,
    meetingUrl: booking.meetingUrl,
    locationDetails: locDetails,
    hostName: host.name || 'Calendio Host',
    guestName: booking.guestName,
    notes: booking.guestNotes || eventType.description,
  });

  const googleCalUrl = getGoogleCalendarUrl({
    title: meetingTitle,
    description: formattedDescription,
    location: formattedLocation,
    startTime: booking.startTime,
    endTime: booking.endTime,
  });

  const outlookCalUrl = getOutlookCalendarUrl({
    title: meetingTitle,
    description: formattedDescription,
    location: formattedLocation,
    startTime: booking.startTime,
    endTime: booking.endTime,
  });

  const officeCalUrl = getOffice365CalendarUrl({
    title: meetingTitle,
    description: formattedDescription,
    location: formattedLocation,
    startTime: booking.startTime,
    endTime: booking.endTime,
  });

  const serializableBooking = {
    id: booking.id,
    uid: booking.uid,
    guestName: booking.guestName,
    guestEmail: booking.guestEmail,
    guestNotes: booking.guestNotes,
    guestTimeZone: booking.guestTimeZone,
    startTime: booking.startTime.toISOString(),
    endTime: booking.endTime.toISOString(),
    meetingUrl: booking.meetingUrl,
    locationType: locType,
    locationDetails: locDetails,
    eventType: {
      title: eventType.title,
      slug: eventType.slug,
      description: eventType.description,
      duration: eventType.duration,
      color: eventType.color,
      locationType: eventType.locationType,
    },
    host: {
      name: host.name,
      email: host.email,
      image: host.image,
      profile: host.profile
        ? {
            username: host.profile.username,
            avatarUrl: host.profile.avatarUrl,
            brandColor: host.profile.brandColor,
          }
        : null,
    },
  };

  return (
    <ConfirmationView
      username={username}
      booking={serializableBooking}
      googleCalUrl={googleCalUrl}
      outlookCalUrl={outlookCalUrl}
      officeCalUrl={officeCalUrl}
    />
  );
}
