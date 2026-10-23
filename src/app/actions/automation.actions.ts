'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { TriggerType, ActionType } from '@prisma/client';
import { interpolateVariables, formatWorkflowEmailHtml } from '@/lib/workflow-engine';
import { sendMailjetEmail } from '@/lib/mailjet';

export interface WorkflowInput {
  name: string;
  trigger: TriggerType;
  offsetMinutes: number;
  isActive?: boolean;
  subject: string;
  template: string;
  action?: ActionType;
  recipient?: 'INVITEE' | 'HOST' | 'BOTH' | 'ADDITIONAL';
  additionalEmail?: string;
  eventTypeIds?: string[];
}

export async function getUserAutomations() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return { success: false, error: 'Unauthorized', data: [] };
  }

  const user = await db.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) {
    return { success: false, error: 'User not found', data: [] };
  }

  const automations = await db.automation.findMany({
    where: { userId: user.id },
    include: {
      workflows: {
        orderBy: { stepOrder: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return { success: true, data: automations };
}

export async function createAutomation(data: WorkflowInput) {
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

    const automation = await db.automation.create({
      data: {
        userId: user.id,
        name: data.name,
        trigger: data.trigger,
        offsetMinutes: Number(data.offsetMinutes) || 0,
        isActive: data.isActive !== undefined ? data.isActive : true,
        workflows: {
          create: {
            stepOrder: 1,
            action: data.action || ActionType.SEND_EMAIL,
            template: data.template,
            config: {
              subject: data.subject,
              recipient: data.recipient || 'INVITEE',
              additionalEmail: data.additionalEmail || null,
              eventTypeIds: data.eventTypeIds || [],
            },
          },
        },
      },
      include: {
        workflows: true,
      },
    });

    revalidatePath('/automations');
    return { success: true, data: automation };
  } catch (error: any) {
    console.error('createAutomation Error:', error);
    return { success: false, error: error.message || 'Failed to create automation' };
  }
}

export async function updateAutomation(id: string, data: WorkflowInput) {
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

    // Verify ownership
    const existing = await db.automation.findFirst({
      where: { id, userId: user.id },
      include: { workflows: true },
    });

    if (!existing) {
      return { success: false, error: 'Workflow not found or permission denied' };
    }

    // Update automation header
    await db.automation.update({
      where: { id },
      data: {
        name: data.name,
        trigger: data.trigger,
        offsetMinutes: Number(data.offsetMinutes) || 0,
        isActive: data.isActive !== undefined ? data.isActive : existing.isActive,
      },
    });

    // Update first workflow step
    if (existing.workflows.length > 0) {
      const firstWorkflow = existing.workflows[0];
      await db.workflow.update({
        where: { id: firstWorkflow.id },
        data: {
          action: data.action || ActionType.SEND_EMAIL,
          template: data.template,
          config: {
            subject: data.subject,
            recipient: data.recipient || 'INVITEE',
            additionalEmail: data.additionalEmail || null,
            eventTypeIds: data.eventTypeIds || [],
          },
        },
      });
    } else {
      await db.workflow.create({
        data: {
          automationId: id,
          stepOrder: 1,
          action: data.action || ActionType.SEND_EMAIL,
          template: data.template,
          config: {
            subject: data.subject,
            recipient: data.recipient || 'INVITEE',
            additionalEmail: data.additionalEmail || null,
            eventTypeIds: data.eventTypeIds || [],
          },
        },
      });
    }

    revalidatePath('/automations');
    return { success: true };
  } catch (error: any) {
    console.error('updateAutomation Error:', error);
    return { success: false, error: error.message || 'Failed to update automation' };
  }
}

export async function toggleAutomationStatus(id: string, isActive: boolean) {
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

    await db.automation.updateMany({
      where: { id, userId: user.id },
      data: { isActive },
    });

    revalidatePath('/automations');
    return { success: true };
  } catch (error: any) {
    console.error('toggleAutomationStatus Error:', error);
    return { success: false, error: error.message || 'Failed to toggle status' };
  }
}

export async function duplicateAutomation(id: string) {
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

    const existing = await db.automation.findFirst({
      where: { id, userId: user.id },
      include: { workflows: true },
    });

    if (!existing) {
      return { success: false, error: 'Workflow not found' };
    }

    await db.automation.create({
      data: {
        userId: user.id,
        name: `${existing.name} (Copy)`,
        trigger: existing.trigger,
        offsetMinutes: existing.offsetMinutes,
        isActive: false, // Start paused
        workflows: {
          create: existing.workflows.map((w) => ({
            stepOrder: w.stepOrder,
            action: w.action,
            template: w.template,
            config: w.config || {},
          })),
        },
      },
    });

    revalidatePath('/automations');
    return { success: true };
  } catch (error: any) {
    console.error('duplicateAutomation Error:', error);
    return { success: false, error: error.message || 'Failed to duplicate' };
  }
}

export async function deleteAutomation(id: string) {
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

    await db.automation.deleteMany({
      where: { id, userId: user.id },
    });

    revalidatePath('/automations');
    return { success: true };
  } catch (error: any) {
    console.error('deleteAutomation Error:', error);
    return { success: false, error: error.message || 'Failed to delete' };
  }
}

export async function sendTestWorkflowEmail({
  subject,
  template,
  testEmail,
}: {
  subject: string;
  template: string;
  testEmail: string;
}) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return { success: false, error: 'Unauthorized' };
    }

    const hostName = session.user.name || 'Calendio Host';
    const sampleData = {
      invitee_full_name: 'Alex Johnson',
      invitee_first_name: 'Alex',
      invitee_last_name: 'Johnson',
      invitee_email: testEmail,
      host_name: hostName,
      host_email: session.user.email,
      event_name: '30 Minute Strategy Call',
      event_date: new Date(Date.now() + 86400000).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
      event_time: '2:00 PM - 2:30 PM EST',
      meeting_url: 'https://meet.google.com/abc-demo-call',
      location: 'Google Meet',
      questions_and_answers: 'What is your primary goal?: Scale automation pipeline',
      cancel_link: '#test-cancel',
      reschedule_link: '#test-reschedule',
    };

    const renderedSubject = `[TEST] ${interpolateVariables(subject, sampleData)}`;
    const renderedBody = interpolateVariables(template, sampleData);

    const html = formatWorkflowEmailHtml({
      subject: renderedSubject,
      bodyContent: renderedBody,
      hostName,
      meetingUrl: sampleData.meeting_url,
      rescheduleLink: sampleData.reschedule_link,
      cancelLink: sampleData.cancel_link,
    });

    const result = await sendMailjetEmail({
      toEmail: testEmail,
      toName: 'Test Recipient',
      subject: renderedSubject,
      html,
      text: renderedBody,
    });

    return { success: true, messageId: result.messageId };
  } catch (error: any) {
    console.error('sendTestWorkflowEmail Error:', error);
    return { success: false, error: error.message || 'Failed to send test email' };
  }
}
