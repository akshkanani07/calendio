'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { slugify } from '@/lib/utils';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import crypto from 'crypto';

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

// 1. GET ALL USER ROUTING FORMS
export async function getUserRoutingForms() {
  try {
    const user = await getAuthUser();

    const forms = await db.$queryRawUnsafe<any[]>(
      'SELECT * FROM "RoutingForm" WHERE "userId" = $1 ORDER BY "createdAt" DESC',
      user.id
    );

    // Fetch submission counts for each form
    const submissions = await db.$queryRawUnsafe<any[]>(
      'SELECT "formId", COUNT(*) as count FROM "RoutingSubmission" GROUP BY "formId"'
    );

    const submissionMap = new Map(submissions.map((s) => [s.formId, Number(s.count)]));

    const formsWithCounts = forms.map((f) => ({
      ...f,
      submissionCount: submissionMap.get(f.id) || 0,
      fields: typeof f.fields === 'string' ? JSON.parse(f.fields) : f.fields || [],
      routes: typeof f.routes === 'string' ? JSON.parse(f.routes) : f.routes || [],
      fallbackDestination:
        typeof f.fallbackDestination === 'string'
          ? JSON.parse(f.fallbackDestination)
          : f.fallbackDestination || { type: 'CUSTOM_MESSAGE', value: 'Thank you for your response!' },
    }));

    return { success: true, forms: formsWithCounts, username: user.profile?.username || 'user' };
  } catch (error: any) {
    console.error('getUserRoutingForms Error:', error);
    return { success: false, error: error.message || 'Failed to fetch forms', forms: [], username: 'user' };
  }
}

// 2. GET SINGLE ROUTING FORM BY SLUG (FOR BUILDER & PUBLIC)
export async function getRoutingFormBySlug(slug: string) {
  try {
    const rows = await db.$queryRawUnsafe<any[]>(
      'SELECT * FROM "RoutingForm" WHERE "slug" = $1 LIMIT 1',
      slug
    );

    const form = rows[0];
    if (!form) return null;

    // Get the creator host
    const user = await db.user.findUnique({
      where: { id: form.userId },
      include: {
        profile: true,
        eventTypes: {
          where: { isActive: true },
          select: { id: true, title: true, slug: true, duration: true, color: true },
        },
      },
    });

    if (!user) return null;

    const parsedForm = {
      ...form,
      fields: typeof form.fields === 'string' ? JSON.parse(form.fields) : form.fields || [],
      routes: typeof form.routes === 'string' ? JSON.parse(form.routes) : form.routes || [],
      fallbackDestination:
        typeof form.fallbackDestination === 'string'
          ? JSON.parse(form.fallbackDestination)
          : form.fallbackDestination || { type: 'CUSTOM_MESSAGE', value: 'Thank you for contacting us!' },
    };

    return {
      form: parsedForm,
      host: {
        id: user.id,
        name: user.name,
        username: user.profile?.username || 'user',
        image: user.image,
        eventTypes: user.eventTypes || [],
      },
    };
  } catch (error) {
    console.error('getRoutingFormBySlug Error:', error);
    return null;
  }
}

// 3. CREATE ROUTING FORM
const CreateRoutingFormSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters.'),
  slug: z.string().min(2, 'Slug must be at least 2 characters.'),
  description: z.string().optional(),
});

export async function createRoutingForm(data: z.infer<typeof CreateRoutingFormSchema>) {
  try {
    const user = await getAuthUser();
    const validated = CreateRoutingFormSchema.parse(data);

    let finalSlug = slugify(validated.slug);

    // Check slug uniqueness
    const existing = await db.$queryRawUnsafe<any[]>(
      'SELECT "id" FROM "RoutingForm" WHERE "slug" = $1 LIMIT 1',
      finalSlug
    );

    if (existing.length > 0) {
      finalSlug = `${finalSlug}-${Math.floor(100 + Math.random() * 900)}`;
    }

    const id = 'rf_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20);

    // Initial default fields template (e.g. Company Size)
    const defaultFields = [
      {
        id: 'field_email',
        label: 'Work Email Address',
        type: 'email',
        required: true,
      },
      {
        id: 'field_company_size',
        label: 'How many employees are in your organization?',
        type: 'select',
        required: true,
        options: ['1 - 10 employees', '11 - 50 employees', '51 - 250 employees', '250+ Enterprise'],
      },
    ];

    const defaultRoutes: any[] = [];
    const defaultFallback = {
      type: 'EVENT_TYPE',
      value: '', // Will default to first active event type or thank you
    };

    await db.$queryRawUnsafe(
      `INSERT INTO "RoutingForm" ("id", "userId", "title", "slug", "description", "fields", "routes", "fallbackDestination", "isActive", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7::jsonb, $8::jsonb, true, NOW(), NOW())`,
      id,
      user.id,
      validated.title.trim(),
      finalSlug,
      validated.description?.trim() || null,
      JSON.stringify(defaultFields),
      JSON.stringify(defaultRoutes),
      JSON.stringify(defaultFallback)
    );

    revalidatePath('/routing');
    return { success: true, slug: finalSlug };
  } catch (error: any) {
    console.error('createRoutingForm Error:', error);
    return { success: false, error: error.message || 'Failed to create routing form.' };
  }
}

// 4. UPDATE ROUTING FORM (FIELDS, RULES, FALLBACK)
export async function updateRoutingForm({
  formId,
  title,
  description,
  fields,
  routes,
  fallbackDestination,
}: {
  formId: string;
  title: string;
  description?: string | null;
  fields: any[];
  routes: any[];
  fallbackDestination: any;
}) {
  try {
    const user = await getAuthUser();

    // Verify ownership
    const forms = await db.$queryRawUnsafe<any[]>(
      'SELECT "id", "slug" FROM "RoutingForm" WHERE "id" = $1 AND "userId" = $2 LIMIT 1',
      formId,
      user.id
    );

    if (forms.length === 0) {
      return { success: false, error: 'Routing form not found or unauthorized.' };
    }

    await db.$queryRawUnsafe(
      `UPDATE "RoutingForm"
       SET "title" = $1,
           "description" = $2,
           "fields" = $3::jsonb,
           "routes" = $4::jsonb,
           "fallbackDestination" = $5::jsonb,
           "updatedAt" = NOW()
       WHERE "id" = $6`,
      title.trim(),
      description?.trim() || null,
      JSON.stringify(fields),
      JSON.stringify(routes),
      JSON.stringify(fallbackDestination),
      formId
    );

    revalidatePath('/routing');
    revalidatePath(`/routing/${forms[0].slug}`);

    return { success: true, message: 'Routing form updated successfully!' };
  } catch (error: any) {
    console.error('updateRoutingForm Error:', error);
    return { success: false, error: error.message || 'Failed to update routing form.' };
  }
}

// 5. DELETE ROUTING FORM
export async function deleteRoutingForm(formId: string) {
  try {
    const user = await getAuthUser();

    await db.$queryRawUnsafe(
      'DELETE FROM "RoutingForm" WHERE "id" = $1 AND "userId" = $2',
      formId,
      user.id
    );

    revalidatePath('/routing');
    return { success: true, message: 'Form deleted successfully.' };
  } catch (error: any) {
    console.error('deleteRoutingForm Error:', error);
    return { success: false, error: error.message || 'Failed to delete form.' };
  }
}

// 6. TOGGLE STATUS (ACTIVE / PAUSED)
export async function toggleRoutingFormStatus(formId: string, isActive: boolean) {
  try {
    const user = await getAuthUser();

    await db.$queryRawUnsafe(
      'UPDATE "RoutingForm" SET "isActive" = $1, "updatedAt" = NOW() WHERE "id" = $2 AND "userId" = $3',
      isActive,
      formId,
      user.id
    );

    revalidatePath('/routing');
    return { success: true };
  } catch (error: any) {
    console.error('toggleRoutingFormStatus Error:', error);
    return { success: false, error: error.message };
  }
}

// 7. SUBMIT PUBLIC ROUTING FORM (RULE EVALUATION ENGINE)
export async function submitRoutingForm({
  formId,
  answers,
  respondentEmail,
}: {
  formId: string;
  answers: Record<string, any>;
  respondentEmail?: string;
}) {
  try {
    const rows = await db.$queryRawUnsafe<any[]>(
      'SELECT * FROM "RoutingForm" WHERE "id" = $1 LIMIT 1',
      formId
    );

    const form = rows[0];
    if (!form || !form.isActive) {
      return { success: false, error: 'This form is no longer accepting submissions.' };
    }

    const host = await db.user.findUnique({
      where: { id: form.userId },
      include: { profile: true },
    });

    if (!host) {
      return { success: false, error: 'Host account not found.' };
    }

    const routes: any[] = typeof form.routes === 'string' ? JSON.parse(form.routes) : form.routes || [];
    const fallback =
      typeof form.fallbackDestination === 'string'
        ? JSON.parse(form.fallbackDestination)
        : form.fallbackDestination || { type: 'CUSTOM_MESSAGE', value: 'Thank you for your response!' };

    let matchedDestination = fallback;

    // Evaluate rules in sequential priority order
    for (const rule of routes) {
      const answerVal = answers[rule.fieldId];
      if (answerVal === undefined || answerVal === null) continue;

      let match = false;
      if (rule.operator === 'EQUALS') {
        match = String(answerVal).toLowerCase().trim() === String(rule.value).toLowerCase().trim();
      } else if (rule.operator === 'CONTAINS') {
        match = String(answerVal).toLowerCase().includes(String(rule.value).toLowerCase());
      } else if (rule.operator === 'IN') {
        const allowed = Array.isArray(rule.value) ? rule.value : [rule.value];
        match = allowed.some((v: any) => String(v).toLowerCase() === String(answerVal).toLowerCase());
      }

      if (match) {
        matchedDestination = {
          type: rule.destinationType,
          value: rule.destinationValue,
        };
        break; // First match wins
      }
    }

    // Determine redirect destination URL
    let targetUrl: string | null = null;
    let customMessage: string | null = null;

    const hostUsername = host.profile?.username || 'user';

    if (matchedDestination.type === 'EVENT_TYPE') {
      targetUrl = `/${hostUsername}/${matchedDestination.value}`;
    } else if (matchedDestination.type === 'EXTERNAL_URL') {
      targetUrl = matchedDestination.value.startsWith('http')
        ? matchedDestination.value
        : `https://${matchedDestination.value}`;
    } else {
      customMessage = matchedDestination.value || 'Thank you! We have received your response.';
    }

    // Record submission into PostgreSQL
    const subId = 'sub_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20);
    const destinationLog = targetUrl || customMessage || 'Submitted';

    await db.$queryRawUnsafe(
      `INSERT INTO "RoutingSubmission" ("id", "formId", "respondentEmail", "answers", "routedTo", "createdAt")
       VALUES ($1, $2, $3, $4::jsonb, $5, NOW())`,
      subId,
      form.id,
      respondentEmail || answers['field_email'] || null,
      JSON.stringify(answers),
      destinationLog
    );

    revalidatePath('/routing');
    revalidatePath(`/routing/${form.slug}`);

    return {
      success: true,
      targetUrl,
      customMessage,
    };
  } catch (error: any) {
    console.error('submitRoutingForm Error:', error);
    return { success: false, error: error.message || 'Failed to submit form.' };
  }
}

// 8. GET FORM SUBMISSIONS
export async function getRoutingFormSubmissions(formId: string) {
  try {
    const user = await getAuthUser();

    const submissions = await db.$queryRawUnsafe<any[]>(
      'SELECT * FROM "RoutingSubmission" WHERE "formId" = $1 ORDER BY "createdAt" DESC',
      formId
    );

    const parsed = submissions.map((s) => ({
      ...s,
      answers: typeof s.answers === 'string' ? JSON.parse(s.answers) : s.answers || {},
    }));

    return { success: true, submissions: parsed };
  } catch (error: any) {
    console.error('getRoutingFormSubmissions Error:', error);
    return { success: false, error: error.message, submissions: [] };
  }
}
