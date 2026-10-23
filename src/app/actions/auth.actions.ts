'use server';

import bcrypt from 'bcryptjs';
import { z } from 'zod';
import crypto from 'crypto';
import { db } from '@/lib/db';
import { slugify } from '@/lib/utils';
import { sendMailjetEmail } from '@/lib/mailjet';
import { getOtpEmailTemplate } from '@/lib/email-templates';

// -------------------------------------------------------------------
// 1. INITIATE REGISTRATION (SEND OTP TO EMAIL VIA MAILJET)
// -------------------------------------------------------------------
const RegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
  timeZone: z.string().default('Asia/Kolkata'),
});

export async function initiateRegisterWithOtp(formData: z.infer<typeof RegisterSchema>) {
  try {
    const validated = RegisterSchema.parse(formData);
    const normalizedEmail = validated.email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return { success: false, error: 'An account with this email already exists. Please log in.' };
    }

    const hashedPassword = await bcrypt.hash(validated.password, 12);
    // Generate 6-digit OTP code (e.g. 749201)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Upsert pending email verification record
    const emailVerDb = (db as any).emailVerification;
    await emailVerDb.upsert({
      where: { email: normalizedEmail },
      update: {
        name: validated.name,
        password: hashedPassword,
        timeZone: validated.timeZone,
        otp,
        expires,
      },
      create: {
        email: normalizedEmail,
        name: validated.name,
        password: hashedPassword,
        timeZone: validated.timeZone,
        otp,
        expires,
      },
    });

    // Send Mailjet Email Template with 6-digit OTP
    const emailTemplate = getOtpEmailTemplate({
      name: validated.name,
      otp,
      expiresMinutes: 10,
    });

    const mailRes = await sendMailjetEmail({
      toEmail: normalizedEmail,
      toName: validated.name,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text,
    });

    if (!mailRes.success) {
      console.warn('Mailjet sending note:', mailRes.error);
    }

    return {
      success: true,
      message: `A 6-digit verification code has been sent to ${normalizedEmail}`,
      email: normalizedEmail,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    console.error('Initiate Register Error:', error);
    return { success: false, error: 'Failed to initiate signup. Please try again.' };
  }
}

// -------------------------------------------------------------------
// 2. RESEND REGISTRATION OTP
// -------------------------------------------------------------------
export async function resendRegisterOtp(email: string) {
  try {
    const normalizedEmail = email.toLowerCase().trim();
    const emailVerDb = (db as any).emailVerification;

    const record = await emailVerDb.findUnique({
      where: { email: normalizedEmail },
    });

    if (!record) {
      return { success: false, error: 'Registration session expired. Please sign up again.' };
    }

    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000);

    await emailVerDb.update({
      where: { email: normalizedEmail },
      data: { otp: newOtp, expires },
    });

    const emailTemplate = getOtpEmailTemplate({
      name: record.name,
      otp: newOtp,
      expiresMinutes: 10,
    });

    await sendMailjetEmail({
      toEmail: normalizedEmail,
      toName: record.name,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text,
    });

    return {
      success: true,
      message: 'New verification code sent to your email!',
    };
  } catch (error) {
    console.error('Resend OTP Error:', error);
    return { success: false, error: 'Failed to resend code.' };
  }
}

// -------------------------------------------------------------------
// 3. VERIFY REGISTRATION OTP & ACTIVATE ACCOUNT
// -------------------------------------------------------------------
export async function verifyRegisterOtpAndCreateUser(email: string, otp: string) {
  try {
    const normalizedEmail = email.toLowerCase().trim();
    const cleanOtp = otp.trim();
    const emailVerDb = (db as any).emailVerification;

    const record = await emailVerDb.findUnique({
      where: { email: normalizedEmail },
    });

    if (!record) {
      return { success: false, error: 'No pending registration found. Please sign up again.' };
    }

    if (record.otp !== cleanOtp) {
      return { success: false, error: 'Invalid verification code. Please check and re-enter.' };
    }

    if (new Date() > record.expires) {
      return { success: false, error: 'Verification code has expired. Please request a new one.' };
    }

    // Generate unique username
    const baseUsername = slugify(record.name) || 'user';
    const uniqueSuffix = Math.floor(1000 + Math.random() * 9000);
    const finalUsername = `${baseUsername}-${uniqueSuffix}`;

    // Database Transaction: Create user, profile, availability, 30m event
    const newUser = await db.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: record.name,
          email: normalizedEmail,
          password: record.password,
          emailVerified: new Date(), // MARKED AS VERIFIED!
          timeZone: record.timeZone,
          role: 'USER',
        },
      });

      await tx.profile.create({
        data: {
          userId: user.id,
          username: finalUsername,
          brandColor: '#0069FF',
        },
      });

      // Default Mon-Fri 09:00 to 17:00
      const days = [1, 2, 3, 4, 5];
      for (const day of days) {
        await tx.availability.create({
          data: {
            userId: user.id,
            dayOfWeek: day,
            startTime: '09:00',
            endTime: '17:00',
            isAvailable: true,
            bufferAfterMin: 15,
            minNoticeHours: 2,
          },
        });
      }

      // Default 30 Min Event
      await tx.eventType.create({
        data: {
          userId: user.id,
          title: '30 Minute Meeting',
          slug: '30min',
          description: 'Quick 1-on-1 meeting via Google Meet.',
          duration: 30,
          color: '#0069FF',
          locationType: 'GOOGLE_MEET',
          isActive: true,
        },
      });

      // Delete verified record
      await emailVerDb.delete({
        where: { email: normalizedEmail },
      });

      return user;
    });

    return {
      success: true,
      message: 'Account verified and created successfully!',
      userId: newUser.id,
    };
  } catch (error) {
    console.error('Verify OTP and Create User Error:', error);
    return { success: false, error: 'Error activating account. Please try again.' };
  }
}

// -------------------------------------------------------------------
// 4. SEND PASSWORD RESET OTP VIA MAILJET
// -------------------------------------------------------------------
export async function sendPasswordResetOtp(email: string) {
  try {
    const normalizedEmail = email.toLowerCase().trim();

    if (!normalizedEmail || !normalizedEmail.includes('@')) {
      return { success: false, error: 'Please enter a valid email address.' };
    }

    const user = await db.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return { success: false, error: 'No account found with this email address.' };
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 10 * 60 * 1000);

    const pwResetDb = (db as any).passwordReset;
    await pwResetDb.deleteMany({
      where: { email: normalizedEmail },
    });

    await pwResetDb.create({
      data: {
        email: normalizedEmail,
        otp,
        token: resetToken,
        expires,
      },
    });

    const emailTemplate = getOtpEmailTemplate({
      name: user.name || undefined,
      otp,
      expiresMinutes: 10,
    });

    await sendMailjetEmail({
      toEmail: normalizedEmail,
      toName: user.name || 'User',
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text,
    });

    return {
      success: true,
      message: 'Verification code sent to your email!',
      token: resetToken,
    };
  } catch (error) {
    console.error('Send OTP Error:', error);
    return { success: false, error: 'Failed to send verification code.' };
  }
}

// -------------------------------------------------------------------
// 5. VERIFY PASSWORD RESET OTP
// -------------------------------------------------------------------
export async function verifyPasswordResetOtp(email: string, otp: string) {
  try {
    const normalizedEmail = email.toLowerCase().trim();
    const cleanOtp = otp.trim();
    const pwResetDb = (db as any).passwordReset;

    const record = await pwResetDb.findFirst({
      where: {
        email: normalizedEmail,
        otp: cleanOtp,
      },
    });

    if (!record) {
      return { success: false, error: 'Invalid verification code. Please check and re-enter.' };
    }

    if (new Date() > record.expires) {
      return { success: false, error: 'This verification code has expired. Please request a new one.' };
    }

    return {
      success: true,
      message: 'Code verified successfully!',
      resetToken: record.token,
    };
  } catch (error) {
    console.error('Verify OTP Error:', error);
    return { success: false, error: 'Error verifying code. Please try again.' };
  }
}

// -------------------------------------------------------------------
// 6. RESET PASSWORD WITH TOKEN
// -------------------------------------------------------------------
export async function resetPasswordWithToken(token: string, newPassword: string) {
  try {
    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters.' };
    }

    const pwResetDb = (db as any).passwordReset;
    const record = await pwResetDb.findUnique({
      where: { token },
    });

    if (!record) {
      return { success: false, error: 'Invalid or expired password reset session.' };
    }

    if (new Date() > record.expires) {
      return { success: false, error: 'Password reset link has expired. Please start over.' };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await db.user.update({
      where: { email: record.email },
      data: { password: hashedPassword },
    });

    await pwResetDb.delete({
      where: { id: record.id },
    });

    return {
      success: true,
      message: 'Your password has been successfully reset. Please log in with your new password.',
    };
  } catch (error) {
    console.error('Reset Password Error:', error);
    return { success: false, error: 'Failed to reset password. Please try again.' };
  }
}
