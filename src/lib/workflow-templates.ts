import { TriggerType, ActionType } from '@prisma/client';

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: 'reminders' | 'follow_ups' | 'bookings';
  trigger: TriggerType;
  offsetMinutes: number; // negative for before meeting, positive for after
  displayTiming: string;
  action: ActionType;
  recipient: 'INVITEE' | 'HOST' | 'BOTH' | 'ADDITIONAL';
  subject: string;
  template: string;
  badgeText: string;
}

export const CALENDLY_WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    id: 'reminder-invitee-24h',
    name: 'Email reminder to invitee (24 hours before)',
    description: 'Send a friendly email reminder 24 hours before the event starts to minimize no-shows.',
    category: 'reminders',
    trigger: TriggerType.BEFORE_MEETING,
    offsetMinutes: -1440, // 24 hours before
    displayTiming: '24 hours before event starts',
    action: ActionType.SEND_EMAIL,
    recipient: 'INVITEE',
    subject: 'Reminder: {event_name} with {host_name} tomorrow',
    template: `Hi {invitee_first_name},

This is a friendly reminder that your upcoming meeting {event_name} with {host_name} is scheduled for tomorrow.

📅 Date: {event_date}
⏰ Time: {event_time}
📍 Location: {meeting_url}

Need to make adjustments to your schedule?
• Reschedule: {reschedule_link}
• Cancel: {cancel_link}

Looking forward to speaking with you!

Best regards,
{host_name}`,
    badgeText: 'Most Popular',
  },
  {
    id: 'reminder-host-1h',
    name: 'Email reminder to host (1 hour before)',
    description: 'Get an alert in your inbox 1 hour before your meeting with invitee details and questions answered.',
    category: 'reminders',
    trigger: TriggerType.BEFORE_MEETING,
    offsetMinutes: -60, // 1 hour before
    displayTiming: '1 hour before event starts',
    action: ActionType.SEND_EMAIL,
    recipient: 'HOST',
    subject: 'Reminder: Upcoming {event_name} with {invitee_full_name} in 1 hour',
    template: `Hi {host_name},

Your upcoming {event_name} with {invitee_full_name} ({invitee_email}) starts in 1 hour.

📅 Date: {event_date}
⏰ Time: {event_time}
📍 Meeting Link: {meeting_url}

Submitted Notes & Questions:
{questions_and_answers}`,
    badgeText: 'Host Alert',
  },
  {
    id: 'reminder-invitee-1h',
    name: 'Email reminder to invitee (1 hour before)',
    description: 'Send a final quick reminder with the direct video call link 1 hour prior to meeting.',
    category: 'reminders',
    trigger: TriggerType.BEFORE_MEETING,
    offsetMinutes: -60, // 1 hour before
    displayTiming: '1 hour before event starts',
    action: ActionType.SEND_EMAIL,
    recipient: 'INVITEE',
    subject: 'Starting soon: {event_name} with {host_name}',
    template: `Hi {invitee_first_name},

Our meeting {event_name} begins in 1 hour!

📅 Date: {event_date}
⏰ Time: {event_time}
📍 Join Video Room: {meeting_url}

See you shortly!
{host_name}`,
    badgeText: 'Quick Reminder',
  },
  {
    id: 'thank-you-invitee-2h',
    name: 'Thank-you email to invitee (2 hours after)',
    description: 'Send a warm follow-up note and open the door for additional questions 2 hours after your meeting ends.',
    category: 'follow_ups',
    trigger: TriggerType.AFTER_MEETING,
    offsetMinutes: 120, // 2 hours after
    displayTiming: '2 hours after event ends',
    action: ActionType.SEND_EMAIL,
    recipient: 'INVITEE',
    subject: 'Thank you for your time today, {invitee_first_name}!',
    template: `Hi {invitee_first_name},

Thank you so much for taking the time to meet with me today for {event_name}.

If you have any further questions or if there is anything else I can support you with, feel free to reply directly to this email.

Wishing you a productive day ahead!

Warm regards,
{host_name}`,
    badgeText: 'Post-Meeting',
  },
  {
    id: 'follow-up-rebook-24h',
    name: 'Request follow-up meeting (24 hours after)',
    description: 'Encourage participants to book their next milestone session 24 hours after your conversation.',
    category: 'follow_ups',
    trigger: TriggerType.AFTER_MEETING,
    offsetMinutes: 1440, // 24 hours after
    displayTiming: '24 hours after event ends',
    action: ActionType.SEND_EMAIL,
    recipient: 'INVITEE',
    subject: 'Next steps following our {event_name}',
    template: `Hi {invitee_first_name},

It was great connecting yesterday during our {event_name}.

Whenever you are ready to book our follow-up session or review our next milestones, you can pick a time that works best for you here:

👉 Book our next session: {reschedule_link}

Talk soon!
{host_name}`,
    badgeText: 'High Conversion',
  },
  {
    id: 'cancellation-re-engagement',
    name: 'Re-engagement email upon cancellation',
    description: 'Automatically reach out when someone cancels to offer easy rebooking options.',
    category: 'bookings',
    trigger: TriggerType.BOOKING_CANCELLED,
    offsetMinutes: 0,
    displayTiming: 'Immediately when event is canceled',
    action: ActionType.SEND_EMAIL,
    recipient: 'INVITEE',
    subject: 'Canceled: {event_name} - Let\'s find another time',
    template: `Hi {invitee_first_name},

Your {event_name} scheduled for {event_date} has been canceled.

I completely understand that schedules shift. When you are ready to reschedule or choose a time that fits better, simply use the link below:

👉 Pick a new time: {reschedule_link}

Have a wonderful week!
{host_name}`,
    badgeText: 'Re-engage',
  },
];
