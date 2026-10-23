'use server';

import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

async function getAuthUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error('Unauthorized');

  const user = await db.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) throw new Error('User not found');
  return user;
}

// 1. SAVE WEEKLY SCHEDULES & LIMITS
export async function saveWeeklyAvailability({
  schedules,
  bufferBeforeMin = 0,
  bufferAfterMin = 15,
  minNoticeHours = 2,
  maxBookingsPerDay = null,
}: {
  schedules: {
    dayOfWeek: number;
    isAvailable: boolean;
    startTime: string;
    endTime: string;
  }[];
  bufferBeforeMin?: number;
  bufferAfterMin?: number;
  minNoticeHours?: number;
  maxBookingsPerDay?: number | null;
}) {
  try {
    const user = await getAuthUser();

    // Use transaction: Delete existing and recreate with new intervals/buffers
    await db.$transaction(async (tx) => {
      await tx.availability.deleteMany({
        where: { userId: user.id },
      });

      for (const item of schedules) {
        await tx.availability.create({
          data: {
            userId: user.id,
            dayOfWeek: item.dayOfWeek,
            isAvailable: item.isAvailable,
            startTime: item.startTime,
            endTime: item.endTime,
            bufferBeforeMin,
            bufferAfterMin,
            minNoticeHours,
            maxBookingsPerDay,
          },
        });
      }
    });

    revalidatePath('/availability');
    revalidatePath('/dashboard');

    return { success: true, message: 'Availability schedule saved successfully!' };
  } catch (error: any) {
    console.error('Save Availability Error:', error);
    return { success: false, error: error.message || 'Failed to save availability.' };
  }
}

// 2. ADD DATE OVERRIDE (VACATION / HOLIDAY)
export async function addDateOverride({
  dateStr,
  isBlocked = true,
  startTime,
  endTime,
  reason,
}: {
  dateStr: string;
  isBlocked?: boolean;
  startTime?: string;
  endTime?: string;
  reason?: string;
}) {
  try {
    const user = await getAuthUser();
    const date = new Date(dateStr);

    const override = await db.dateOverride.create({
      data: {
        userId: user.id,
        date,
        isBlocked,
        startTime: isBlocked ? null : startTime,
        endTime: isBlocked ? null : endTime,
        reason: reason || (isBlocked ? 'Vacation / Day Off' : 'Custom Hours'),
      },
    });

    revalidatePath('/availability');
    return { success: true, data: override };
  } catch (error: any) {
    console.error('Add Date Override Error:', error);
    return { success: false, error: error.message || 'Failed to add date override.' };
  }
}

// 3. DELETE DATE OVERRIDE
export async function deleteDateOverride(id: string) {
  try {
    const user = await getAuthUser();

    await db.dateOverride.deleteMany({
      where: { id, userId: user.id },
    });

    revalidatePath('/availability');
    return { success: true };
  } catch (error: any) {
    console.error('Delete Date Override Error:', error);
    return { success: false, error: error.message || 'Failed to delete date override.' };
  }
}

// 4. UPDATE USER TIMEZONE
export async function updateUserTimeZone(timeZone: string) {
  try {
    const user = await getAuthUser();

    await db.user.update({
      where: { id: user.id },
      data: { timeZone },
    });

    revalidatePath('/availability');
    return { success: true };
  } catch (error: any) {
    console.error('Update Timezone Error:', error);
    return { success: false, error: error.message || 'Failed to update time zone.' };
  }
}
