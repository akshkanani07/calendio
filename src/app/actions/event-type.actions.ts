'use server';

import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { slugify } from '@/lib/utils';
import { z } from 'zod';

const EventTypeSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters.'),
  slug: z.string().min(2, 'Slug must be at least 2 characters.'),
  description: z.string().optional(),
  duration: z.coerce.number().min(5, 'Duration must be at least 5 minutes.'),
  color: z.string().default('#0069FF'),
  schedulingType: z.enum(['ONE_ON_ONE', 'GROUP', 'ROUND_ROBIN', 'COLLECTIVE']).default('ONE_ON_ONE'),
  locationType: z.enum(['GOOGLE_MEET', 'ZOOM', 'MS_TEAMS', 'PHONE_CALL', 'IN_PERSON', 'CUSTOM']).default('GOOGLE_MEET'),
  locationUrl: z.string().optional(),
  maxParticipants: z.coerce.number().default(1),
  customQuestions: z.any().optional(),
});

async function getAuthUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error('Unauthorized');

  const user = await db.user.findUnique({
    where: { email: session.user.email },
    include: { profile: true },
  });

  if (!user) throw new Error('User not found');
  return user;
}

// CREATE EVENT TYPE
export async function createEventType(formData: any) {
  try {
    const user = await getAuthUser();
    const validated = EventTypeSchema.parse(formData);

    let finalSlug = slugify(validated.slug);
    // Check if slug exists for this user
    let counter = 1;
    let existing = await db.eventType.findUnique({
      where: {
        userId_slug: {
          userId: user.id,
          slug: finalSlug,
        },
      },
    });

    while (existing) {
      finalSlug = `${slugify(validated.slug)}-${counter}`;
      existing = await db.eventType.findUnique({
        where: {
          userId_slug: {
            userId: user.id,
            slug: finalSlug,
          },
        },
      });
      counter++;
    }

    const newEventType = await db.eventType.create({
      data: {
        userId: user.id,
        title: validated.title,
        slug: finalSlug,
        description: validated.description || null,
        duration: validated.duration,
        color: validated.color,
        schedulingType: validated.schedulingType,
        locationType: validated.locationType,
        locationUrl: validated.locationUrl || null,
        maxParticipants: validated.maxParticipants,
        customQuestions: validated.customQuestions || null,
        isActive: true,
      },
    });

    revalidatePath('/event-types');
    revalidatePath('/dashboard');

    return { success: true, data: newEventType };
  } catch (error: any) {
    console.error('Create EventType Error:', error);
    return { success: false, error: error.message || 'Failed to create event type.' };
  }
}

// UPDATE EVENT TYPE
export async function updateEventType(id: string, formData: any) {
  try {
    const user = await getAuthUser();
    const validated = EventTypeSchema.parse(formData);

    const existing = await db.eventType.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) throw new Error('Event type not found or access denied.');

    const updated = await db.eventType.update({
      where: { id },
      data: {
        title: validated.title,
        slug: slugify(validated.slug),
        description: validated.description || null,
        duration: validated.duration,
        color: validated.color,
        schedulingType: validated.schedulingType,
        locationType: validated.locationType,
        locationUrl: validated.locationUrl || null,
        maxParticipants: validated.maxParticipants,
        customQuestions: validated.customQuestions || null,
      },
    });

    revalidatePath('/event-types');
    revalidatePath('/dashboard');

    return { success: true, data: updated };
  } catch (error: any) {
    console.error('Update EventType Error:', error);
    return { success: false, error: error.message || 'Failed to update event type.' };
  }
}

// TOGGLE STATUS (ACTIVE / INACTIVE)
export async function toggleEventTypeStatus(id: string, isActive: boolean) {
  try {
    const user = await getAuthUser();

    await db.eventType.updateMany({
      where: { id, userId: user.id },
      data: { isActive },
    });

    revalidatePath('/event-types');
    revalidatePath('/dashboard');

    return { success: true };
  } catch (error: any) {
    console.error('Toggle EventType Error:', error);
    return { success: false, error: error.message || 'Failed to update status.' };
  }
}

// DUPLICATE EVENT TYPE
export async function duplicateEventType(id: string) {
  try {
    const user = await getAuthUser();

    const original = await db.eventType.findFirst({
      where: { id, userId: user.id },
    });

    if (!original) throw new Error('Original event type not found.');

    const newSlug = `${original.slug}-copy-${Math.floor(100 + Math.random() * 900)}`;

    const copy = await db.eventType.create({
      data: {
        userId: user.id,
        title: `Copy of ${original.title}`,
        slug: newSlug,
        description: original.description,
        duration: original.duration,
        color: original.color,
        schedulingType: original.schedulingType,
        locationType: original.locationType,
        locationUrl: original.locationUrl,
        maxParticipants: original.maxParticipants,
        customQuestions: original.customQuestions as any,
        isActive: true,
      },
    });

    revalidatePath('/event-types');
    revalidatePath('/dashboard');

    return { success: true, data: copy };
  } catch (error: any) {
    console.error('Duplicate EventType Error:', error);
    return { success: false, error: error.message || 'Failed to duplicate event type.' };
  }
}

// DELETE EVENT TYPE
export async function deleteEventType(id: string) {
  try {
    const user = await getAuthUser();

    await db.eventType.deleteMany({
      where: { id, userId: user.id },
    });

    revalidatePath('/event-types');
    revalidatePath('/dashboard');

    return { success: true };
  } catch (error: any) {
    console.error('Delete EventType Error:', error);
    return { success: false, error: error.message || 'Failed to delete event type.' };
  }
}
