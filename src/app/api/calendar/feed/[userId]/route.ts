import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: Request,
  props: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await props.params;

    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    // Fetch confirmed bookings
    const bookings = await db.booking.findMany({
      where: {
        hostId: user.id,
        status: { in: ['CONFIRMED', 'COMPLETED'] },
      },
      include: {
        eventType: true,
      },
      orderBy: { startTime: 'desc' },
      take: 200,
    });

    const formatIcsDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    // Build VCALENDAR feed
    const now = formatIcsDate(new Date());

    const events = bookings.map((b) => {
      const start = formatIcsDate(new Date(b.startTime));
      const end = formatIcsDate(new Date(b.endTime));
      const summary = `${b.eventType?.title || 'Meeting'} - ${b.guestName}`;
      const desc = `Calendio Meeting with ${b.guestName} (${b.guestEmail})${b.guestNotes ? `\\nNotes: ${b.guestNotes}` : ''}${b.meetingUrl ? `\\nMeeting Link: ${b.meetingUrl}` : ''}`;
      const location = b.meetingUrl || b.eventType?.locationType || 'Calendio Video Room';

      return [
        'BEGIN:VEVENT',
        `UID:${b.uid}@calendio.com`,
        `DTSTAMP:${now}`,
        `DTSTART:${start}`,
        `DTEND:${end}`,
        `SUMMARY:${summary.replace(/\n/g, ' ')}`,
        `DESCRIPTION:${desc.replace(/\n/g, '\\n')}`,
        `LOCATION:${location}`,
        `ORGANIZER;CN="${user.name || 'Calendio Host'}":mailto:${user.email}`,
        `ATTENDEE;CN="${b.guestName}":mailto:${b.guestEmail}`,
        'STATUS:CONFIRMED',
        'END:VEVENT',
      ].join('\r\n');
    });

    const icsFeed = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Calendio//Smart Scheduling Calendar Feed//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      `X-WR-CALNAME:Calendio - ${user.name || 'Schedule'}`,
      'X-WR-TIMEZONE:UTC',
      ...events,
      'END:VCALENDAR',
    ].join('\r\n');

    return new NextResponse(icsFeed, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `inline; filename="calendio-${user.id}.ics"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error: any) {
    console.error('Calendar Feed Error:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
