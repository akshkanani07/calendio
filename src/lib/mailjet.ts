/**
 * Mailjet Email Service for Calendio
 * Direct REST API Integration (https://api.mailjet.com/v3.1/send)
 * Includes graceful local development fallback (logs to console if keys not set)
 */

interface SendEmailParams {
  toEmail: string;
  toName?: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendMailjetEmail({
  toEmail,
  toName = '',
  subject,
  html,
  text = '',
}: SendEmailParams): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const apiKey = process.env.MAILJET_API_KEY;
  const secretKey = process.env.MAILJET_SECRET_KEY;
  const senderEmail = process.env.MAILJET_SENDER_EMAIL || process.env.SMTP_FROM || 'support@calendio.com';
  const senderName = process.env.MAILJET_SENDER_NAME || 'Calendio Scheduling';

  // Local development / Test fallback: If Mailjet credentials are not configured yet,
  // log OTP / Email clearly to server console so registration and reset can be tested immediately!
  if (!apiKey || !secretKey) {
    console.log('\n======================================================');
    console.log('📧 [DEV EMAIL SIMULATION - Mailjet Keys Not Configured]');
    console.log(`To: ${toName ? toName + ' <' + toEmail + '>' : toEmail}`);
    console.log(`Subject: ${subject}`);
    console.log('Content Summary / Text:');
    console.log(text || '(HTML Email generated)');
    console.log('======================================================\n');
    return { success: true, messageId: 'simulated_dev_id_' + Date.now() };
  }

  try {
    const authHeader = 'Basic ' + Buffer.from(`${apiKey}:${secretKey}`).toString('base64');

    const payload = {
      Messages: [
        {
          From: {
            Email: senderEmail,
            Name: senderName,
          },
          To: [
            {
              Email: toEmail,
              Name: toName,
            },
          ],
          Subject: subject,
          TextPart: text,
          HTMLPart: html,
        },
      ],
    };

    const response = await fetch('https://api.mailjet.com/v3.1/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Mailjet API Error:', data);
      return { success: false, error: data.ErrorMessage || 'Failed to send email via Mailjet' };
    }

    const messageId = data?.Messages?.[0]?.To?.[0]?.MessageID?.toString();
    return { success: true, messageId };
  } catch (error) {
    console.error('Mailjet Network Error:', error);
    return { success: false, error: 'Network error communicating with Mailjet' };
  }
}
