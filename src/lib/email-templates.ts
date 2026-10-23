/**
 * Calendio Premium HTML Email Templates
 * Responsive, dark/light compatible, inline CSS for maximum email client compatibility
 */

export function getOtpEmailTemplate({
  name,
  otp,
  expiresMinutes = 10,
}: {
  name?: string;
  otp: string;
  expiresMinutes?: number;
}): { subject: string; html: string; text: string } {
  const subject = `${otp} is your Calendio verification code`;
  const text = `Hello ${name || 'there'}, your Calendio verification code is: ${otp}. It expires in ${expiresMinutes} minutes.`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 520px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); overflow: hidden;">
          <tr>
            <td style="padding: 32px 32px 24px 32px; border-bottom: 1px solid #f1f5f9;">
              <table role="presentation" width="100%">
                <tr>
                  <td>
                    <span style="font-size: 22px; font-weight: 800; color: #0069ff; letter-spacing: -0.5px;">Calendio</span>
                  </td>
                  <td align="right">
                    <span style="font-size: 11px; font-weight: 600; color: #059669; background-color: #ecfdf5; padding: 4px 10px; border-radius: 999px; text-transform: uppercase;">Security OTP</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px;">
              <h1 style="font-size: 20px; font-weight: 700; color: #0f172a; margin: 0 0 12px 0;">Verification Code</h1>
              <p style="font-size: 14px; line-height: 22px; color: #475569; margin: 0 0 24px 0;">
                Hello ${name ? name : 'there'}, use the following one-time verification code to verify your account or reset your password.
              </p>
              <div style="background-color: #f0f7ff; border: 1px dashed #0069ff; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
                <span style="font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #0069ff; font-family: monospace;">${otp}</span>
              </div>
              <p style="font-size: 13px; line-height: 20px; color: #64748b; margin: 0 0 8px 0;">
                ⏰ This code will expire in <strong>${expiresMinutes} minutes</strong>.
              </p>
              <p style="font-size: 12px; line-height: 18px; color: #94a3b8; margin: 0;">
                If you did not request this code, you can safely ignore this email.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f8fafc; padding: 20px 32px; border-top: 1px solid #f1f5f9; text-align: center;">
              <p style="font-size: 12px; color: #94a3b8; margin: 0 0 4px 0;">
                Calendio • Smart Scheduling For Everyone • 100% Free Platform
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

  return { subject, html, text };
}

export function getPasswordResetEmailTemplate({
  name,
  resetUrl,
}: {
  name?: string;
  resetUrl: string;
}): { subject: string; html: string; text: string } {
  const subject = 'Reset your Calendio password';
  const text = `Hello ${name || 'there'}, click the link below to reset your Calendio password: ${resetUrl}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 520px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); overflow: hidden;">
          <tr>
            <td style="padding: 32px 32px 24px 32px; border-bottom: 1px solid #f1f5f9;">
              <span style="font-size: 22px; font-weight: 800; color: #0069ff;">Calendio</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px;">
              <h1 style="font-size: 20px; font-weight: 700; color: #0f172a; margin: 0 0 12px 0;">Reset Your Password</h1>
              <p style="font-size: 14px; line-height: 22px; color: #475569; margin: 0 0 24px 0;">
                We received a request to reset your password for your Calendio account. Click the button below to choose a new password.
              </p>
              <div style="text-align: center; margin: 32px 0;">
                <a href="${resetUrl}" style="background-color: #0069ff; color: #ffffff; padding: 14px 28px; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 10px; display: inline-block; box-shadow: 0 2px 8px rgba(0, 105, 255, 0.25);">
                  Reset Password
                </a>
              </div>
              <p style="font-size: 12px; line-height: 18px; color: #94a3b8; margin: 0;">
                This link will expire in 30 minutes. If you did not request a password reset, no action is needed.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f8fafc; padding: 20px 32px; border-top: 1px solid #f1f5f9; text-align: center;">
              <p style="font-size: 11px; color: #94a3b8; margin: 0;">
                © 2026 Calendio • Smart Scheduling For Everyone
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

  return { subject, html, text };
}

// 3. BOOKING CONFIRMATION EMAIL FOR GUEST
export function getBookingConfirmationEmailTemplate({
  guestName,
  hostName,
  eventTitle,
  formattedDateTime,
  timeZone,
  meetingUrl,
  locationType = 'GOOGLE_MEET',
  locationDetails,
  notes,
}: {
  guestName: string;
  hostName: string;
  eventTitle: string;
  formattedDateTime: string;
  timeZone: string;
  meetingUrl?: string | null;
  locationType?: string;
  locationDetails?: any;
  notes?: string | null;
}): { subject: string; html: string; text: string } {
  const subject = `Confirmed: ${eventTitle} with ${hostName} on ${formattedDateTime}`;
  const text = `Hello ${guestName},\n\nYour meeting "${eventTitle}" with ${hostName} has been confirmed for ${formattedDateTime} (${timeZone}).\n\n${meetingUrl ? 'Join / Location: ' + meetingUrl : ''}\n\nThank you,\nCalendio Team`;

  const getButtonText = () => {
    switch (locationType) {
      case 'ZOOM': return 'Join Zoom Meeting';
      case 'MS_TEAMS': return 'Join Microsoft Teams';
      case 'MS_TEAMS_PERSONAL': return 'Join Teams Personal';
      case 'WEBEX': return 'Join Webex Meeting';
      case 'GOTO_MEETING': return 'Join GoTo Meeting';
      case 'AROUND': return 'Join Around Video';
      case 'WHEREBY': return 'Join Whereby Room';
      case 'PHONE_CALL': return 'Call Phone Number';
      case 'IN_PERSON': return 'View Location on Google Maps';
      case 'CUSTOM': return 'Join Custom Meeting';
      default: return 'Join Google Meet';
    }
  };

  const getButtonBg = () => {
    switch (locationType) {
      case 'ZOOM': return '#2D8CFF';
      case 'MS_TEAMS':
      case 'MS_TEAMS_PERSONAL': return '#5B5FC7';
      case 'WEBEX': return '#00BCEB';
      case 'GOTO_MEETING': return '#FF6F00';
      case 'AROUND': return '#5E35B1';
      case 'WHEREBY': return '#005555';
      case 'PHONE_CALL': return '#10B981';
      case 'IN_PERSON': return '#EA580C';
      default: return '#0069ff';
    }
  };

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 540px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06); overflow: hidden;">
          <tr>
            <td style="background-color: #0069ff; padding: 24px 32px; text-align: left;">
              <span style="font-size: 20px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">Calendio</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px;">
              <div style="display: inline-block; background-color: #ecfdf5; color: #059669; font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 999px; text-transform: uppercase; margin-bottom: 12px;">
                ✓ Confirmed
              </div>
              <h1 style="font-size: 22px; font-weight: 800; color: #0f172a; margin: 0 0 16px 0;">
                You're scheduled with ${hostName}!
              </h1>
              <p style="font-size: 14px; line-height: 22px; color: #475569; margin: 0 0 24px 0;">
                Hi ${guestName}, an invitation has been added to your calendar for <strong>${eventTitle}</strong>.
              </p>
              <table role="presentation" width="100%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #64748b; width: 100px;">When:</td>
                  <td style="padding: 6px 0; font-size: 14px; font-weight: 700; color: #0f172a;">${formattedDateTime}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #64748b;">Timezone:</td>
                  <td style="padding: 6px 0; font-size: 14px; color: #334155;">${timeZone}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #64748b;">Host:</td>
                  <td style="padding: 6px 0; font-size: 14px; color: #334155;">${hostName}</td>
                </tr>
                ${meetingUrl ? `
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #64748b;">Conferencing:</td>
                  <td style="padding: 6px 0; font-size: 14px; color: #0069ff; word-break: break-all;">
                    <a href="${meetingUrl}" style="color: #0069ff; text-decoration: underline;">${meetingUrl}</a>
                  </td>
                </tr>
                ` : ''}
              </table>
              ${meetingUrl ? `
              <div style="text-align: center; margin-bottom: 20px;">
                <a href="${meetingUrl}" style="background-color: ${getButtonBg()}; color: #ffffff; padding: 14px 28px; font-size: 14px; font-weight: 700; text-decoration: none; border-radius: 10px; display: inline-block;">
                  ${getButtonText()}
                </a>
              </div>
              ` : ''}
              ${(locationDetails?.meetingId || locationDetails?.passcode || locationDetails?.dialIn || locationDetails?.address) ? `
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px 16px; margin-bottom: 20px; font-size: 12px; color: #475569;">
                <strong style="color: #1e293b; display: block; margin-bottom: 4px;">Meeting Credentials / Details:</strong>
                ${locationDetails.meetingId ? `<div><strong>ID / Access Code:</strong> ${locationDetails.meetingId}</div>` : ''}
                ${locationDetails.passcode ? `<div><strong>Passcode:</strong> ${locationDetails.passcode}</div>` : ''}
                ${locationDetails.dialIn ? `<div><strong>Dial-in:</strong> ${locationDetails.dialIn}</div>` : ''}
                ${locationDetails.address ? `<div><strong>Address:</strong> ${locationDetails.address}</div>` : ''}
              </div>
              ` : ''}
              ${notes ? `
              <div style="background-color: #f1f5f9; border-radius: 8px; padding: 12px 16px; margin-bottom: 20px;">
                <span style="font-size: 12px; font-weight: 600; color: #475569;">Your Notes:</span>
                <p style="font-size: 13px; color: #1e293b; margin: 4px 0 0 0;">${notes}</p>
              </div>
              ` : ''}
            </td>
          </tr>
          <tr>
            <td style="background-color: #f8fafc; padding: 20px 32px; border-top: 1px solid #f1f5f9; text-align: center;">
              <p style="font-size: 11px; color: #94a3b8; margin: 0;">
                Calendio • 100% Free Smart Scheduling For Everyone
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

  return { subject, html, text };
}

// 4. HOST BOOKING NOTIFICATION EMAIL
export function getHostBookingNotificationTemplate({
  hostName,
  guestName,
  guestEmail,
  eventTitle,
  formattedDateTime,
  timeZone,
  meetingUrl,
  locationType = 'GOOGLE_MEET',
  locationDetails,
  notes,
}: {
  hostName: string;
  guestName: string;
  guestEmail: string;
  eventTitle: string;
  formattedDateTime: string;
  timeZone: string;
  meetingUrl?: string | null;
  locationType?: string;
  locationDetails?: any;
  notes?: string | null;
}): { subject: string; html: string; text: string } {
  const subject = `New Event: ${guestName} - ${eventTitle} on ${formattedDateTime}`;
  const text = `Hello ${hostName},\n\n${guestName} (${guestEmail}) has booked: "${eventTitle}" on ${formattedDateTime} (${timeZone}).\n\n${meetingUrl ? 'Meeting URL / Location: ' + meetingUrl : ''}\n\nCalendio Team`;

  const getProviderName = () => {
    switch (locationType) {
      case 'ZOOM': return 'Zoom Video';
      case 'MS_TEAMS': return 'Microsoft Teams';
      case 'MS_TEAMS_PERSONAL': return 'Microsoft Teams (Personal)';
      case 'WEBEX': return 'Cisco Webex';
      case 'GOTO_MEETING': return 'GoTo Meeting';
      case 'AROUND': return 'Around Video';
      case 'WHEREBY': return 'Whereby Room';
      case 'PHONE_CALL': return 'Phone Call';
      case 'IN_PERSON': return 'In-Person Meeting';
      case 'CUSTOM': return 'Custom Meeting Link';
      default: return 'Google Meet';
    }
  };

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 540px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06); overflow: hidden;">
          <tr>
            <td style="background-color: #0f172a; padding: 24px 32px; text-align: left;">
              <span style="font-size: 20px; font-weight: 800; color: #ffffff;">Calendio</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px;">
              <h1 style="font-size: 22px; font-weight: 800; color: #0f172a; margin: 0 0 16px 0;">
                New booking scheduled!
              </h1>
              <p style="font-size: 14px; line-height: 22px; color: #475569; margin: 0 0 24px 0;">
                Hi ${hostName}, <strong>${guestName}</strong> (${guestEmail}) booked <strong>${eventTitle}</strong> with you.
              </p>
              <table role="presentation" width="100%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #64748b; width: 100px;">When:</td>
                  <td style="padding: 6px 0; font-size: 14px; font-weight: 700; color: #0f172a;">${formattedDateTime}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #64748b;">Guest:</td>
                  <td style="padding: 6px 0; font-size: 14px; color: #334155;">${guestName} (${guestEmail})</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #64748b;">Provider:</td>
                  <td style="padding: 6px 0; font-size: 14px; font-weight: 600; color: #0f172a;">${getProviderName()}</td>
                </tr>
                ${meetingUrl ? `
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #64748b;">Join Link:</td>
                  <td style="padding: 6px 0; font-size: 14px; color: #0069ff; word-break: break-all;">
                    <a href="${meetingUrl}" style="color: #0069ff;">${meetingUrl}</a>
                  </td>
                </tr>
                ` : ''}
              </table>
              ${(locationDetails?.meetingId || locationDetails?.passcode || locationDetails?.dialIn || locationDetails?.address) ? `
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px 16px; margin-bottom: 20px; font-size: 12px; color: #475569;">
                <strong style="color: #1e293b; display: block; margin-bottom: 4px;">Meeting Credentials / Details:</strong>
                ${locationDetails.meetingId ? `<div><strong>ID / Access Code:</strong> ${locationDetails.meetingId}</div>` : ''}
                ${locationDetails.passcode ? `<div><strong>Passcode:</strong> ${locationDetails.passcode}</div>` : ''}
                ${locationDetails.dialIn ? `<div><strong>Dial-in:</strong> ${locationDetails.dialIn}</div>` : ''}
                ${locationDetails.address ? `<div><strong>Address:</strong> ${locationDetails.address}</div>` : ''}
              </div>
              ` : ''}
              ${notes ? `
              <div style="background-color: #f1f5f9; border-radius: 8px; padding: 12px 16px; margin-bottom: 20px;">
                <span style="font-size: 12px; font-weight: 600; color: #475569;">Guest Notes:</span>
                <p style="font-size: 13px; color: #1e293b; margin: 4px 0 0 0;">${notes}</p>
              </div>
              ` : ''}
            </td>
          </tr>
          <tr>
            <td style="background-color: #f8fafc; padding: 20px 32px; border-top: 1px solid #f1f5f9; text-align: center;">
              <p style="font-size: 11px; color: #94a3b8; margin: 0;">
                Calendio • 100% Free Smart Scheduling For Everyone
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

  return { subject, html, text };
}

// 5. CANCELLATION EMAIL NOTIFICATION (GUEST & HOST)
export function getBookingCancelledEmailTemplate({
  eventTitle,
  hostName,
  guestName,
  formattedDateTime,
  timeZone,
  cancelReason,
  rebookUrl,
}: {
  eventTitle: string;
  hostName: string;
  guestName: string;
  formattedDateTime: string;
  timeZone: string;
  cancelReason?: string | null;
  rebookUrl?: string | null;
}): { subject: string; html: string; text: string } {
  const subject = `Cancelled: ${eventTitle} with ${hostName} on ${formattedDateTime}`;
  const text = `Hello ${guestName},\n\nThe meeting "${eventTitle}" with ${hostName} scheduled for ${formattedDateTime} (${timeZone}) has been cancelled.\n\nReason: ${cancelReason || 'No reason specified'}\n\n${rebookUrl ? 'To rebook a new time, click here: ' + rebookUrl : ''}\n\nCalendio Team`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 540px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06); overflow: hidden;">
          <!-- Top Accent Header (Rose Red) -->
          <tr>
            <td style="background-color: #e11d48; padding: 24px 32px; text-align: left;">
              <span style="font-size: 20px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">Calendio</span>
            </td>
          </tr>

          <!-- Main Body -->
          <tr>
            <td style="padding: 32px;">
              <div style="display: inline-block; background-color: #fff1f2; color: #e11d48; font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 999px; text-transform: uppercase; margin-bottom: 12px;">
                ✕ Cancelled
              </div>
              <h1 style="font-size: 22px; font-weight: 800; color: #0f172a; margin: 0 0 16px 0;">
                Meeting Cancelled
              </h1>
              <p style="font-size: 14px; line-height: 22px; color: #475569; margin: 0 0 24px 0;">
                Hi <strong>${guestName}</strong>, your meeting <strong>${eventTitle}</strong> with <strong>${hostName}</strong> has been cancelled.
              </p>

              <!-- Event Details Box -->
              <table role="presentation" width="100%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #64748b; width: 100px;">When:</td>
                  <td style="padding: 6px 0; font-size: 14px; font-weight: 700; color: #0f172a; text-decoration: line-through;">${formattedDateTime}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #64748b;">Timezone:</td>
                  <td style="padding: 6px 0; font-size: 14px; color: #334155;">${timeZone}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #64748b;">Host:</td>
                  <td style="padding: 6px 0; font-size: 14px; color: #334155;">${hostName}</td>
                </tr>
                ${cancelReason ? `
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #64748b;">Reason:</td>
                  <td style="padding: 6px 0; font-size: 14px; font-weight: 600; color: #e11d48;">${cancelReason}</td>
                </tr>
                ` : ''}
              </table>

              ${rebookUrl ? `
              <div style="text-align: center; margin-bottom: 24px;">
                <a href="${rebookUrl}" style="background-color: #0069ff; color: #ffffff; padding: 14px 28px; font-size: 14px; font-weight: 700; text-decoration: none; border-radius: 10px; display: inline-block; box-shadow: 0 3px 10px rgba(0, 105, 255, 0.25);">
                  Book a New Time
                </a>
              </div>
              ` : ''}

              <p style="font-size: 12px; color: #94a3b8; margin: 0;">
                If you have questions about this cancellation, please contact ${hostName} directly.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 20px 32px; border-top: 1px solid #f1f5f9; text-align: center;">
              <p style="font-size: 11px; color: #94a3b8; margin: 0;">
                Calendio • 100% Free Smart Scheduling For Everyone
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

  return { subject, html, text };
}

// 6. RESCHEDULE EMAIL NOTIFICATION
export function getBookingRescheduledEmailTemplate({
  eventTitle,
  hostName,
  guestName,
  newFormattedDateTime,
  timeZone,
  meetingUrl,
  rescheduleReason,
}: {
  eventTitle: string;
  hostName: string;
  guestName: string;
  newFormattedDateTime: string;
  timeZone: string;
  meetingUrl?: string | null;
  rescheduleReason?: string | null;
}): { subject: string; html: string; text: string } {
  const subject = `Rescheduled: ${eventTitle} with ${hostName} for ${newFormattedDateTime}`;
  const text = `Hello ${guestName},\n\nThe meeting "${eventTitle}" with ${hostName} has been rescheduled to ${newFormattedDateTime} (${timeZone}).\n\n${meetingUrl ? 'Join Meeting: ' + meetingUrl + '\n\n' : ''}Calendio Team`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 540px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06); overflow: hidden;">
          <tr>
            <td style="background-color: #f59e0b; padding: 24px 32px; text-align: left;">
              <span style="font-size: 20px; font-weight: 800; color: #ffffff;">Calendio</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px;">
              <div style="display: inline-block; background-color: #fffbeb; color: #b45309; font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 999px; text-transform: uppercase; margin-bottom: 12px;">
                ↻ Rescheduled
              </div>
              <h1 style="font-size: 22px; font-weight: 800; color: #0f172a; margin: 0 0 16px 0;">
                Meeting Rescheduled
              </h1>
              <p style="font-size: 14px; line-height: 22px; color: #475569; margin: 0 0 24px 0;">
                Hi <strong>${guestName}</strong>, your meeting <strong>${eventTitle}</strong> has been updated to a new time.
              </p>
              <table role="presentation" width="100%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #64748b; width: 100px;">New Time:</td>
                  <td style="padding: 6px 0; font-size: 14px; font-weight: 700; color: #0f172a;">${newFormattedDateTime}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #64748b;">Timezone:</td>
                  <td style="padding: 6px 0; font-size: 14px; color: #334155;">${timeZone}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #64748b;">Host:</td>
                  <td style="padding: 6px 0; font-size: 14px; color: #334155;">${hostName}</td>
                </tr>
                ${rescheduleReason ? `
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #64748b;">Reason:</td>
                  <td style="padding: 6px 0; font-size: 14px; color: #334155;">${rescheduleReason}</td>
                </tr>
                ` : ''}
              </table>
              ${meetingUrl ? `
              <div style="text-align: center; margin-bottom: 24px;">
                <a href="${meetingUrl}" style="background-color: #0069ff; color: #ffffff; padding: 14px 28px; font-size: 14px; font-weight: 700; text-decoration: none; border-radius: 10px; display: inline-block;">
                  Join Google Meet
                </a>
              </div>
              ` : ''}
            </td>
          </tr>
          <tr>
            <td style="background-color: #f8fafc; padding: 20px 32px; border-top: 1px solid #f1f5f9; text-align: center;">
              <p style="font-size: 11px; color: #94a3b8; margin: 0;">
                Calendio • 100% Free Smart Scheduling For Everyone
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

  return { subject, html, text };
}

// 7. TEAM INVITATION EMAIL (FOR USERS & NON-USERS)
export function getTeamInvitationEmailTemplate({
  teamName,
  inviterName,
  inviterEmail,
  inviteUrl,
  role = 'MEMBER',
}: {
  teamName: string;
  inviterName: string;
  inviterEmail: string;
  inviteUrl: string;
  role?: string;
}): { subject: string; html: string; text: string } {
  const subject = `You've been invited to join "${teamName}" on Calendio`;
  const text = `Hello,\n\n${inviterName} (${inviterEmail}) has invited you to join team "${teamName}" as a ${role} on Calendio.\n\nTo accept this invitation, click here: ${inviteUrl}\n\nCalendio is a 100% free appointment scheduling platform.\n\nThank you,\nCalendio Team`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 540px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06); overflow: hidden;">
          <tr>
            <td style="background-color: #4f46e5; padding: 24px 32px; text-align: left;">
              <table role="presentation" width="100%">
                <tr>
                  <td>
                    <span style="font-size: 20px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">Calendio</span>
                  </td>
                  <td align="right">
                    <span style="font-size: 11px; font-weight: 700; color: #e0e7ff; background-color: rgba(255,255,255,0.15); padding: 4px 10px; border-radius: 999px; text-transform: uppercase;">Team Invitation</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px;">
              <h1 style="font-size: 22px; font-weight: 800; color: #0f172a; margin: 0 0 16px 0;">
                Join ${teamName} on Calendio
              </h1>
              <p style="font-size: 14px; line-height: 22px; color: #475569; margin: 0 0 24px 0;">
                Hi there, <strong>${inviterName}</strong> (${inviterEmail}) has invited you to collaborate in <strong>${teamName}</strong> as a <strong>${role}</strong>.
              </p>
              <table role="presentation" width="100%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #64748b; width: 100px;">Team:</td>
                  <td style="padding: 6px 0; font-size: 14px; font-weight: 700; color: #0f172a;">${teamName}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #64748b;">Invited By:</td>
                  <td style="padding: 6px 0; font-size: 14px; color: #334155;">${inviterName}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #64748b;">Role:</td>
                  <td style="padding: 6px 0; font-size: 14px; font-weight: 600; color: #4f46e5;">${role}</td>
                </tr>
              </table>
              <div style="text-align: center; margin-bottom: 24px;">
                <a href="${inviteUrl}" style="background-color: #4f46e5; color: #ffffff; padding: 14px 28px; font-size: 14px; font-weight: 700; text-decoration: none; border-radius: 10px; display: inline-block; box-shadow: 0 3px 10px rgba(79, 70, 229, 0.25);">
                  Accept Invitation & Join Team
                </a>
              </div>
              <p style="font-size: 13px; line-height: 20px; color: #64748b; margin: 0 0 12px 0;">
                Calendio is a 100% free appointment scheduling platform. Accept this invitation to collaborate on collective scheduling and round-robin meetings with your team.
              </p>
              <p style="font-size: 12px; color: #94a3b8; margin: 0;">
                This invitation link will expire in 7 days. If you do not have an account yet, you will be able to create one for free when accepting.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f8fafc; padding: 20px 32px; border-top: 1px solid #f1f5f9; text-align: center;">
              <p style="font-size: 11px; color: #94a3b8; margin: 0;">
                Calendio • 100% Free Smart Scheduling For Everyone
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

  return { subject, html, text };
}
