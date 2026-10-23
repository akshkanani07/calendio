/**
 * Calendio Workflow & Automations Engine
 * Handles template variable interpolation, HTML email generation,
 * and automated trigger execution.
 */

import { db } from '@/lib/db';
import { sendMailjetEmail } from '@/lib/mailjet';
import { TriggerType, ActionType } from '@prisma/client';

export interface WorkflowVariableData {
  invitee_full_name: string;
  invitee_first_name: string;
  invitee_last_name: string;
  invitee_email: string;
  host_name: string;
  host_email: string;
  event_name: string;
  event_date: string;
  event_time: string;
  event_description?: string;
  meeting_url: string;
  location?: string;
  questions_and_answers?: string;
  cancel_link?: string;
  reschedule_link?: string;
  current_year?: string;
}

export const WORKFLOW_VARIABLES: { key: keyof WorkflowVariableData; label: string; example: string }[] = [
  { key: 'invitee_full_name', label: 'Invitee Full Name', example: 'Sarah Jenkins' },
  { key: 'invitee_first_name', label: 'Invitee First Name', example: 'Sarah' },
  { key: 'invitee_last_name', label: 'Invitee Last Name', example: 'Jenkins' },
  { key: 'invitee_email', label: 'Invitee Email', example: 'sarah@example.com' },
  { key: 'host_name', label: 'Host Name', example: 'Alex Morgan' },
  { key: 'host_email', label: 'Host Email', example: 'alex@calendio.com' },
  { key: 'event_name', label: 'Event Name', example: '30 Minute Discovery Call' },
  { key: 'event_date', label: 'Event Date', example: 'Thursday, October 29, 2026' },
  { key: 'event_time', label: 'Event Time', example: '2:30 PM - 3:00 PM EST' },
  { key: 'meeting_url', label: 'Meeting Link', example: 'https://meet.google.com/abc-defg-hij' },
  { key: 'location', label: 'Location', example: 'Google Meet' },
  { key: 'questions_and_answers', label: 'Questions & Answers', example: 'Project Goal: Launch MVP' },
  { key: 'cancel_link', label: 'Cancel Link', example: 'https://calendio.com/bookings/cancel/xyz' },
  { key: 'reschedule_link', label: 'Reschedule Link', example: 'https://calendio.com/bookings/reschedule/xyz' },
];

/**
 * Replaces both {variable} and {{variable}} tags with corresponding values.
 */
export function interpolateVariables(template: string, data: Partial<WorkflowVariableData>): string {
  if (!template) return '';
  let result = template;

  const fullData: WorkflowVariableData = {
    invitee_full_name: data.invitee_full_name || 'Sarah Jenkins',
    invitee_first_name: data.invitee_first_name || (data.invitee_full_name ? data.invitee_full_name.split(' ')[0] : 'Sarah'),
    invitee_last_name: data.invitee_last_name || (data.invitee_full_name ? data.invitee_full_name.split(' ').slice(1).join(' ') : 'Jenkins'),
    invitee_email: data.invitee_email || 'guest@example.com',
    host_name: data.host_name || 'Alex Morgan',
    host_email: data.host_email || 'host@calendio.com',
    event_name: data.event_name || 'Discovery Meeting',
    event_date: data.event_date || 'Thursday, October 29, 2026',
    event_time: data.event_time || '2:30 PM - 3:00 PM EST',
    event_description: data.event_description || 'Product walkthrough and onboarding.',
    meeting_url: data.meeting_url || 'https://meet.google.com/abc-defg-hij',
    location: data.location || 'Google Meet',
    questions_and_answers: data.questions_and_answers || 'None provided.',
    cancel_link: data.cancel_link || '#',
    reschedule_link: data.reschedule_link || '#',
    current_year: new Date().getFullYear().toString(),
  };

  Object.entries(fullData).forEach(([key, value]) => {
    const doubleRegex = new RegExp(`\\{\\{${key}\\}\\}`, 'gi');
    const singleRegex = new RegExp(`\\{${key}\\}`, 'gi');
    result = result.replace(doubleRegex, value || '').replace(singleRegex, value || '');
  });

  return result;
}

/**
 * Generates Calendly-grade branded HTML email with modern clean typography and responsive design
 */
export function formatWorkflowEmailHtml({
  subject,
  bodyContent,
  hostName,
  meetingUrl,
  rescheduleLink,
  cancelLink,
}: {
  subject: string;
  bodyContent: string;
  hostName: string;
  meetingUrl?: string;
  rescheduleLink?: string;
  cancelLink?: string;
}): string {
  // Convert newlines to paragraphs / breaks
  const formattedBody = bodyContent
    .split('\n\n')
    .map((para) => `<p style="margin: 0 0 16px 0; line-height: 1.6; color: #334155;">${para.replace(/\n/g, '<br/>')}</p>`)
    .join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);">
          
          <!-- Header Bar -->
          <tr>
            <td style="background: linear-gradient(135deg, #0069ff 0%, #004ecc 100%); padding: 24px 32px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <span style="color: #ffffff; font-size: 20px; font-weight: 800; letter-spacing: -0.5px;">Calendio</span>
                    <span style="color: rgba(255, 255, 255, 0.8); font-size: 13px; margin-left: 8px; font-weight: 500;">Workflow Notification</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 36px 32px 28px 32px; font-size: 15px; color: #1e293b;">
              ${formattedBody}

              ${
                meetingUrl
                  ? `
                <div style="margin: 28px 0 20px 0; text-align: center;">
                  <a href="${meetingUrl}" target="_blank" style="display: inline-block; background-color: #0069ff; color: #ffffff; padding: 13px 28px; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 10px; box-shadow: 0 2px 6px rgba(0, 105, 255, 0.35);">
                    Join Meeting Video Call &rarr;
                  </a>
                </div>
              `
                  : ''
              }

              ${
                rescheduleLink || cancelLink
                  ? `
                <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; text-align: center;">
                  Need to change this meeting?
                  ${rescheduleLink ? `<a href="${rescheduleLink}" style="color: #0069ff; text-decoration: underline; margin: 0 6px;">Reschedule</a>` : ''}
                  ${rescheduleLink && cancelLink ? '&bull;' : ''}
                  ${cancelLink ? `<a href="${cancelLink}" style="color: #ef4444; text-decoration: underline; margin: 0 6px;">Cancel</a>` : ''}
                </div>
              `
                  : ''
              }
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 20px 32px; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #94a3b8;">
                Sent via <strong style="color: #475569;">Calendio Workflows</strong> on behalf of ${hostName}.
              </p>
              <p style="margin: 6px 0 0 0; font-size: 11px; color: #cbd5e1;">
                Calendio Inc. &bull; Smart Scheduling For Everyone &bull; 100% Free
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Triggers active automations for a given user & trigger event
 */
export async function executeAutomationsForTrigger({
  userId,
  eventTypeId,
  trigger,
  data,
}: {
  userId: string;
  eventTypeId: string;
  trigger: TriggerType;
  data: Partial<WorkflowVariableData>;
}): Promise<{ totalTriggered: number }> {
  try {
    const automations = await db.automation.findMany({
      where: {
        userId,
        trigger,
        isActive: true,
      },
      include: {
        workflows: {
          orderBy: { stepOrder: 'asc' },
        },
      },
    });

    let totalTriggered = 0;

    for (const auto of automations) {
      for (const step of auto.workflows) {
        const config = (step.config || {}) as {
          subject?: string;
          recipient?: 'INVITEE' | 'HOST' | 'BOTH' | 'ADDITIONAL';
          additionalEmail?: string;
          eventTypeIds?: string[];
        };

        // If specific event types are configured, check if this eventTypeId is included
        if (config.eventTypeIds && config.eventTypeIds.length > 0) {
          if (!config.eventTypeIds.includes(eventTypeId)) {
            continue; // Skip this workflow step as it does not match this event type
          }
        }

        const subjectRaw = config.subject || auto.name;
        const renderedSubject = interpolateVariables(subjectRaw, data);
        const renderedBody = interpolateVariables(step.template, data);

        const html = formatWorkflowEmailHtml({
          subject: renderedSubject,
          bodyContent: renderedBody,
          hostName: data.host_name || 'Calendio Host',
          meetingUrl: data.meeting_url,
          rescheduleLink: data.reschedule_link,
          cancelLink: data.cancel_link,
        });

        const recipientType = config.recipient || 'INVITEE';

        // 1. Send to Invitee
        if ((recipientType === 'INVITEE' || recipientType === 'BOTH') && data.invitee_email) {
          await sendMailjetEmail({
            toEmail: data.invitee_email,
            toName: data.invitee_full_name || 'Invitee',
            subject: renderedSubject,
            html,
            text: renderedBody,
          });
          totalTriggered++;
        }

        // 2. Send to Host
        if ((recipientType === 'HOST' || recipientType === 'BOTH') && data.host_email) {
          await sendMailjetEmail({
            toEmail: data.host_email,
            toName: data.host_name || 'Host',
            subject: renderedSubject,
            html,
            text: renderedBody,
          });
          totalTriggered++;
        }

        // 3. Send to Additional Email
        if (recipientType === 'ADDITIONAL' && config.additionalEmail) {
          await sendMailjetEmail({
            toEmail: config.additionalEmail,
            toName: 'Participant',
            subject: renderedSubject,
            html,
            text: renderedBody,
          });
          totalTriggered++;
        }
      }
    }

    return { totalTriggered };
  } catch (error) {
    console.error('executeAutomationsForTrigger Error:', error);
    return { totalTriggered: 0 };
  }
}
