/**
 * Calendio Calendar Export Utilities
 * RFC 5545 iCalendar (.ics) generation & Calendar URL links (Google, Outlook, Office 365)
 */

function formatToIcsDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

function formatToGoogleDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

export function generateIcsContent({
  uid,
  title,
  description,
  location,
  startTime,
  endTime,
  hostName,
  hostEmail,
  guestName,
  guestEmail,
}: {
  uid: string;
  title: string;
  description?: string;
  location?: string;
  startTime: Date;
  endTime: Date;
  hostName: string;
  hostEmail: string;
  guestName: string;
  guestEmail: string;
}): string {
  const startStr = formatToIcsDate(startTime);
  const endStr = formatToIcsDate(endTime);
  const nowStr = formatToIcsDate(new Date());

  const cleanDesc = (description || 'Scheduled via Calendio')
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');

  const cleanLocation = (location || '')
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,');

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Calendio//Smart Scheduling//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${uid}@calendio.com`,
    `DTSTAMP:${nowStr}`,
    `DTSTART:${startStr}`,
    `DTEND:${endStr}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${cleanDesc}`,
    `LOCATION:${cleanLocation}`,
    `ORGANIZER;CN=${hostName}:mailto:${hostEmail}`,
    `ATTENDEE;CUTYPE=INDIVIDUAL;ROLE=REQ-PARTICIPANT;PARTSTAT=ACCEPTED;CN=${guestName}:mailto:${guestEmail}`,
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

export function getGoogleCalendarUrl({
  title,
  description,
  location,
  startTime,
  endTime,
}: {
  title: string;
  description?: string;
  location?: string;
  startTime: Date;
  endTime: Date;
}): string {
  const dates = `${formatToGoogleDate(startTime)}/${formatToGoogleDate(endTime)}`;
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: dates,
    details: description || 'Scheduled with Calendio',
    location: location || '',
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function getOutlookCalendarUrl({
  title,
  description,
  location,
  startTime,
  endTime,
}: {
  title: string;
  description?: string;
  location?: string;
  startTime: Date;
  endTime: Date;
}): string {
  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: title,
    body: description || 'Scheduled with Calendio',
    startdt: startTime.toISOString(),
    enddt: endTime.toISOString(),
    location: location || '',
  });
  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}

export function getOffice365CalendarUrl({
  title,
  description,
  location,
  startTime,
  endTime,
}: {
  title: string;
  description?: string;
  location?: string;
  startTime: Date;
  endTime: Date;
}): string {
  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: title,
    body: description || 'Scheduled with Calendio',
    startdt: startTime.toISOString(),
    enddt: endTime.toISOString(),
    location: location || '',
  });
  return `https://outlook.office.com/calendar/0/deeplink/compose?${params.toString()}`;
}
