import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateIcsContent } from '@/lib/calendar-export';
import { formatLocationForCalendar, formatInstructionsForCalendar } from '@/lib/meeting-providers';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const uid = searchParams.get('uid');

    if (!uid) {
      return new NextResponse('Booking UID is required', { status: 400 });
    }

    const booking = await db.booking.findUnique({
      where: { uid },
      include: {
        eventType: true,
        host: true,
      },
    });

    if (!booking) {
      return new NextResponse('Booking not found', { status: 404 });
    }

    const locType = (booking as any).locationType || booking.eventType.locationType || 'GOOGLE_MEET';
    const locDetails = (booking as any).locationDetails || null;

    const formattedLocation = formatLocationForCalendar(locType, booking.meetingUrl, locDetails);
    const formattedDescription = formatInstructionsForCalendar({
      locationType: locType,
      meetingUrl: booking.meetingUrl,
      locationDetails: locDetails,
      hostName: booking.host.name || 'Calendio Host',
      guestName: booking.guestName,
      notes: booking.guestNotes || booking.eventType.description,
    });

    const ics = generateIcsContent({
      uid: booking.uid,
      title: `${booking.eventType.title} with ${booking.host.name || 'Host'}`,
      description: formattedDescription,
      location: formattedLocation,
      startTime: booking.startTime,
      endTime: booking.endTime,
      hostName: booking.host.name || 'Calendio Host',
      hostEmail: booking.host.email,
      guestName: booking.guestName,
      guestEmail: booking.guestEmail,
    });

    return new NextResponse(ics, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="invite-${booking.uid.slice(0, 8)}.ics"`,
      },
    });
  } catch (error: any) {
    console.error('ICS Download Error:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
