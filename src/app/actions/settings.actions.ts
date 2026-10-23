'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';

export interface ProfileSettingsInput {
  name: string;
  username: string;
  timeZone: string;
  bio?: string;
  company?: string;
  phone?: string;
  avatarUrl?: string;
}

export interface BrandingSettingsInput {
  brandColor: string;
  customDomain?: string;
}

export interface ChangePasswordInput {
  currentPassword?: string;
  newPassword: string;
}

export async function getUserSettingsData() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return { success: false, error: 'Unauthorized' };
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      include: {
        profile: true,
      },
    });

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    return {
      success: true,
      data: {
        id: user.id,
        name: user.name || '',
        email: user.email,
        timeZone: user.timeZone || 'Asia/Kolkata',
        role: user.role,
        hasPassword: !!user.password,
        username: user.profile?.username || user.email.split('@')[0],
        bio: user.profile?.bio || '',
        company: user.profile?.company || '',
        phone: user.profile?.phone || '',
        brandColor: user.profile?.brandColor || '#0069FF',
        avatarUrl: user.profile?.avatarUrl || user.image || '',
        customDomain: user.profile?.customDomain || '',
      },
    };
  } catch (error: any) {
    console.error('getUserSettingsData Error:', error);
    return { success: false, error: error.message };
  }
}

export async function updateProfileSettings(data: ProfileSettingsInput) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return { success: false, error: 'Unauthorized' };
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      include: { profile: true },
    });

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    const cleanUsername = data.username.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '');
    if (!cleanUsername || cleanUsername.length < 3) {
      return { success: false, error: 'Username must be at least 3 characters and contain only letters, numbers, hyphens, and underscores.' };
    }

    // Check username uniqueness if changed
    if (user.profile && user.profile.username !== cleanUsername) {
      const conflict = await db.profile.findUnique({
        where: { username: cleanUsername },
      });
      if (conflict && conflict.userId !== user.id) {
        return { success: false, error: `The username "${cleanUsername}" is already taken by another user.` };
      }
    }

    // Update User core fields
    await db.user.update({
      where: { id: user.id },
      data: {
        name: data.name.trim(),
        timeZone: data.timeZone,
        image: data.avatarUrl?.trim() || user.image,
      },
    });

    // Upsert Profile
    await db.profile.upsert({
      where: { userId: user.id },
      update: {
        username: cleanUsername,
        bio: data.bio?.trim() || null,
        company: data.company?.trim() || null,
        phone: data.phone?.trim() || null,
        avatarUrl: data.avatarUrl?.trim() || null,
      },
      create: {
        userId: user.id,
        username: cleanUsername,
        bio: data.bio?.trim() || null,
        company: data.company?.trim() || null,
        phone: data.phone?.trim() || null,
        avatarUrl: data.avatarUrl?.trim() || null,
        brandColor: '#0069FF',
      },
    });

    revalidatePath('/settings');
    revalidatePath('/dashboard');
    revalidatePath(`/${cleanUsername}`);
    return { success: true };
  } catch (error: any) {
    console.error('updateProfileSettings Error:', error);
    return { success: false, error: error.message || 'Failed to update profile' };
  }
}

export async function updateBrandingSettings(data: BrandingSettingsInput) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return { success: false, error: 'Unauthorized' };
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    await db.profile.update({
      where: { userId: user.id },
      data: {
        brandColor: data.brandColor || '#0069FF',
        customDomain: data.customDomain?.trim() || null,
      },
    });

    revalidatePath('/settings');
    return { success: true };
  } catch (error: any) {
    console.error('updateBrandingSettings Error:', error);
    return { success: false, error: error.message || 'Failed to update branding' };
  }
}

export async function updatePasswordSettings(data: ChangePasswordInput) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return { success: false, error: 'Unauthorized' };
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    if (data.newPassword.length < 6) {
      return { success: false, error: 'New password must be at least 6 characters long.' };
    }

    // If user already has a password, verify current password
    if (user.password) {
      if (!data.currentPassword) {
        return { success: false, error: 'Current password is required.' };
      }
      const isMatch = await bcrypt.compare(data.currentPassword, user.password);
      if (!isMatch) {
        return { success: false, error: 'Current password is incorrect.' };
      }
    }

    const hashedPassword = await bcrypt.hash(data.newPassword, 10);

    await db.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return { success: true, message: 'Password updated successfully.' };
  } catch (error: any) {
    console.error('updatePasswordSettings Error:', error);
    return { success: false, error: error.message || 'Failed to change password' };
  }
}

export async function deleteUserAccount() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return { success: false, error: 'Unauthorized' };
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    await db.user.delete({
      where: { id: user.id },
    });

    return { success: true };
  } catch (error: any) {
    console.error('deleteUserAccount Error:', error);
    return { success: false, error: error.message || 'Failed to delete account' };
  }
}
