'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { sendMailjetEmail } from '@/lib/mailjet';
import { getTeamInvitationEmailTemplate } from '@/lib/email-templates';
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

// 1. GET ALL USER TEAMS
export async function getUserTeams() {
  try {
    const user = await getAuthUser();

    // Fetch teams without the 'invitations' relation in include
    const teams = await db.team.findMany({
      where: {
        OR: [
          { ownerId: user.id },
          { members: { some: { userId: user.id } } },
        ],
      },
      include: {
        owner: {
          include: { profile: true },
        },
        members: {
          include: {
            user: {
              include: { profile: true },
            },
          },
        },
        eventTypes: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Fetch pending invitations for these teams via SQL
    let allInvitations: any[] = [];
    try {
      allInvitations = await db.$queryRawUnsafe<any[]>(
        'SELECT * FROM "TeamInvitation" WHERE "status" = $1',
        'PENDING'
      );
    } catch {
      allInvitations = [];
    }

    const teamsWithInvitations = teams.map((team) => ({
      ...team,
      invitations: allInvitations.filter((inv) => inv.teamId === team.id),
    }));

    return { success: true, teams: teamsWithInvitations };
  } catch (error: any) {
    console.error('getUserTeams Error:', error);
    return { success: false, error: error.message || 'Failed to fetch teams', teams: [] };
  }
}

// 2. GET SINGLE TEAM DETAILS BY SLUG
export async function getTeamBySlug(slug: string) {
  try {
    const user = await getAuthUser();

    const team = await db.team.findUnique({
      where: { slug },
      include: {
        owner: {
          include: { profile: true },
        },
        members: {
          include: {
            user: {
              include: { profile: true },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        eventTypes: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!team) return null;

    // Verify member or owner
    const isMember = (team.members as any[]).some((m: any) => m.userId === user.id) || team.ownerId === user.id;
    if (!isMember) return null;

    const userMembership = (team.members as any[]).find((m: any) => m.userId === user.id);
    const userRole = team.ownerId === user.id ? 'OWNER' : userMembership?.role || 'MEMBER';

    // Fetch invitations for this team
    let invitations: any[] = [];
    try {
      invitations = await db.$queryRawUnsafe<any[]>(
        'SELECT * FROM "TeamInvitation" WHERE "teamId" = $1 ORDER BY "createdAt" DESC',
        team.id
      );
    } catch {
      invitations = [];
    }

    return {
      team: {
        ...team,
        invitations,
      },
      userRole,
      isOwner: team.ownerId === user.id,
      isAdmin: userRole === 'OWNER' || userRole === 'ADMIN',
    };
  } catch (error) {
    console.error('getTeamBySlug Error:', error);
    return null;
  }
}

// 3. CREATE NEW TEAM
const CreateTeamSchema = z.object({
  name: z.string().min(2, 'Team name must be at least 2 characters.'),
  slug: z.string().min(2, 'Team URL slug must be at least 2 characters.'),
  description: z.string().optional(),
});

export async function createTeam(data: z.infer<typeof CreateTeamSchema>) {
  try {
    const user = await getAuthUser();
    const validated = CreateTeamSchema.parse(data);

    let finalSlug = slugify(validated.slug);

    // Check slug uniqueness
    const existing = await db.team.findUnique({
      where: { slug: finalSlug },
    });

    if (existing) {
      finalSlug = `${finalSlug}-${Math.floor(100 + Math.random() * 900)}`;
    }

    const team = await db.$transaction(async (tx) => {
      const newTeam = await tx.team.create({
        data: {
          ownerId: user.id,
          name: validated.name.trim(),
          slug: finalSlug,
          description: validated.description?.trim() || null,
        },
      });

      // Add owner as first team member
      await tx.teamMember.create({
        data: {
          teamId: newTeam.id,
          userId: user.id,
          role: 'OWNER',
          priority: 1,
        },
      });

      return newTeam;
    });

    revalidatePath('/teams');
    return { success: true, team };
  } catch (error: any) {
    console.error('createTeam Error:', error);
    return { success: false, error: error.message || 'Failed to create team.' };
  }
}

// 4. INVITE TEAM MEMBER (WORKS FOR REGISTERED AND NON-REGISTERED USERS!)
const InviteMemberSchema = z.object({
  teamId: z.string().min(1),
  email: z.string().email('Please enter a valid email address.'),
  role: z.enum(['MEMBER', 'ADMIN']).default('MEMBER'),
  priority: z.coerce.number().default(1),
});

export async function inviteTeamMember(data: z.infer<typeof InviteMemberSchema>) {
  try {
    const user = await getAuthUser();
    const validated = InviteMemberSchema.parse(data);
    const targetEmail = validated.email.toLowerCase().trim();

    // Verify user is OWNER or ADMIN
    const team = await db.team.findUnique({
      where: { id: validated.teamId },
      include: {
        members: true,
      },
    });

    if (!team) return { success: false, error: 'Team not found.' };

    const memberRecord = team.members.find((m) => m.userId === user.id);
    const isAuthorized = team.ownerId === user.id || memberRecord?.role === 'ADMIN';

    if (!isAuthorized) {
      return { success: false, error: 'Only team owners or admins can invite new members.' };
    }

    // Check if user already exists and is already an active member
    const targetUser = await db.user.findUnique({ where: { email: targetEmail } });
    if (targetUser) {
      const alreadyMember = team.members.some((m) => m.userId === targetUser.id);
      if (alreadyMember) {
        return { success: false, error: 'This user is already an active member of this team.' };
      }
    }

    // Upsert invitation token directly into PostgreSQL
    const token = crypto.randomUUID();
    const id = 'inv_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days expiration

    await db.$queryRawUnsafe(
      `INSERT INTO "TeamInvitation" ("id", "teamId", "email", "role", "priority", "token", "status", "expiresAt", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4::"TeamRole", $5, $6, $7, $8, NOW(), NOW())
       ON CONFLICT ("teamId", "email") DO UPDATE
       SET "role" = EXCLUDED."role",
           "priority" = EXCLUDED."priority",
           "token" = EXCLUDED."token",
           "status" = 'PENDING',
           "expiresAt" = EXCLUDED."expiresAt",
           "updatedAt" = NOW()`,
      id,
      team.id,
      targetEmail,
      validated.role,
      validated.priority,
      token,
      'PENDING',
      expiresAt
    );

    // Formulate accept invite link
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const inviteUrl = `${baseUrl}/teams/invite/${token}`;

    // Send invitation email via Mailjet
    const emailContent = getTeamInvitationEmailTemplate({
      teamName: team.name,
      inviterName: user.name || 'A team member',
      inviterEmail: user.email,
      inviteUrl,
      role: validated.role,
    });

    await sendMailjetEmail({
      toEmail: targetEmail,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    });

    revalidatePath(`/teams/${team.slug}`);
    revalidatePath('/teams');

    return {
      success: true,
      message: `Invitation sent to ${targetEmail}! They can join even if they don't have an account yet.`,
    };
  } catch (error: any) {
    console.error('inviteTeamMember Error:', error);
    return { success: false, error: error.message || 'Failed to send invitation.' };
  }
}

// 5. RESEND INVITATION
export async function resendTeamInvitation(invitationId: string) {
  try {
    const user = await getAuthUser();

    const invitations = await db.$queryRawUnsafe<any[]>(
      'SELECT * FROM "TeamInvitation" WHERE "id" = $1 LIMIT 1',
      invitationId
    );
    const invitation = invitations[0];

    if (!invitation) return { success: false, error: 'Invitation not found.' };

    const team = await db.team.findUnique({
      where: { id: invitation.teamId },
    });

    if (!team) return { success: false, error: 'Team not found.' };

    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await db.$queryRawUnsafe(
      'UPDATE "TeamInvitation" SET "token" = $1, "expiresAt" = $2, "status" = $3, "updatedAt" = NOW() WHERE "id" = $4',
      token,
      expiresAt,
      'PENDING',
      invitationId
    );

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const inviteUrl = `${baseUrl}/teams/invite/${token}`;

    const emailContent = getTeamInvitationEmailTemplate({
      teamName: team.name,
      inviterName: user.name || 'Team Admin',
      inviterEmail: user.email,
      inviteUrl,
      role: invitation.role,
    });

    await sendMailjetEmail({
      toEmail: invitation.email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    });

    revalidatePath(`/teams/${team.slug}`);
    return { success: true, message: `Invitation resent to ${invitation.email}.` };
  } catch (error: any) {
    console.error('resendTeamInvitation Error:', error);
    return { success: false, error: error.message || 'Failed to resend invitation.' };
  }
}

// 6. REVOKE INVITATION
export async function revokeTeamInvitation(invitationId: string) {
  try {
    const user = await getAuthUser();

    const invitations = await db.$queryRawUnsafe<any[]>(
      'SELECT * FROM "TeamInvitation" WHERE "id" = $1 LIMIT 1',
      invitationId
    );
    const invitation = invitations[0];

    if (!invitation) return { success: false, error: 'Invitation not found.' };

    const team = await db.team.findUnique({
      where: { id: invitation.teamId },
    });

    await db.$queryRawUnsafe(
      'DELETE FROM "TeamInvitation" WHERE "id" = $1',
      invitationId
    );

    if (team) {
      revalidatePath(`/teams/${team.slug}`);
    }
    return { success: true, message: 'Invitation revoked.' };
  } catch (error: any) {
    console.error('revokeTeamInvitation Error:', error);
    return { success: false, error: error.message || 'Failed to revoke invitation.' };
  }
}

// 7. REMOVE TEAM MEMBER
export async function removeTeamMember({
  teamId,
  memberId,
}: {
  teamId: string;
  memberId: string;
}) {
  try {
    const user = await getAuthUser();

    const team = await db.team.findUnique({
      where: { id: teamId },
    });

    if (!team) return { success: false, error: 'Team not found.' };
    if (team.ownerId !== user.id) {
      return { success: false, error: 'Only the team owner can remove members.' };
    }

    const member = await db.teamMember.findUnique({
      where: { id: memberId },
    });

    if (!member) return { success: false, error: 'Member not found.' };
    if (member.role === 'OWNER') {
      return { success: false, error: 'Cannot remove the team owner.' };
    }

    await db.teamMember.delete({
      where: { id: memberId },
    });

    revalidatePath(`/teams/${team.slug}`);
    return { success: true, message: 'Member removed from team.' };
  } catch (error: any) {
    console.error('removeTeamMember Error:', error);
    return { success: false, error: error.message || 'Failed to remove member.' };
  }
}

// 8. CREATE TEAM EVENT TYPE (ROUND-ROBIN OR COLLECTIVE)
const CreateTeamEventTypeSchema = z.object({
  teamId: z.string().min(1),
  title: z.string().min(2, 'Title is required.'),
  slug: z.string().min(2, 'Slug is required.'),
  duration: z.coerce.number().min(5),
  color: z.string().optional().default('#4F46E5'),
  schedulingType: z.enum(['ROUND_ROBIN', 'COLLECTIVE']).optional().default('ROUND_ROBIN'),
  locationType: z.enum(['GOOGLE_MEET', 'PHONE_CALL', 'IN_PERSON', 'CUSTOM']).optional().default('GOOGLE_MEET'),
  description: z.string().optional(),
});

export async function createTeamEventType(data: z.infer<typeof CreateTeamEventTypeSchema>) {
  try {
    const user = await getAuthUser();
    const validated = CreateTeamEventTypeSchema.parse(data);

    const team = await db.team.findUnique({
      where: { id: validated.teamId },
    });

    if (!team) return { success: false, error: 'Team not found.' };

    let finalSlug = slugify(validated.slug);

    const event = await db.eventType.create({
      data: {
        userId: user.id,
        teamId: team.id,
        title: validated.title.trim(),
        slug: finalSlug,
        duration: validated.duration,
        color: validated.color || '#4F46E5',
        schedulingType: validated.schedulingType || 'ROUND_ROBIN',
        locationType: (validated.locationType as any) || 'GOOGLE_MEET',
        description: validated.description?.trim() || null,
        isActive: true,
      },
    });

    revalidatePath(`/teams/${team.slug}`);
    revalidatePath('/event-types');

    return { success: true, event };
  } catch (error: any) {
    console.error('createTeamEventType Error:', error);
    return { success: false, error: error.message || 'Failed to create team event type.' };
  }
}

// 9. ACCEPT INVITATION BY TOKEN
export async function acceptTeamInvitation(token: string) {
  try {
    const session = await getServerSession(authOptions);

    const invitations = await db.$queryRawUnsafe<any[]>(
      'SELECT * FROM "TeamInvitation" WHERE "token" = $1 LIMIT 1',
      token
    );
    const invitation = invitations[0];

    if (!invitation || invitation.status !== 'PENDING') {
      return { success: false, error: 'This invitation is invalid or has already been used.' };
    }

    if (new Date(invitation.expiresAt) < new Date()) {
      return { success: false, error: 'This invitation link has expired.' };
    }

    const team = await db.team.findUnique({
      where: { id: invitation.teamId },
    });

    if (!team) {
      return { success: false, error: 'Team not found.' };
    }

    // If user is not authenticated yet, indicate they need to log in or register
    if (!session?.user?.email) {
      return {
        requiresAuth: true,
        email: invitation.email,
        teamName: team.name,
      };
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return { requiresAuth: true, email: invitation.email };
    }

    // Add user as TeamMember in transaction
    await db.$transaction(async (tx) => {
      await tx.teamMember.upsert({
        where: {
          teamId_userId: {
            teamId: invitation.teamId,
            userId: user.id,
          },
        },
        update: {
          role: invitation.role,
          priority: invitation.priority,
        },
        create: {
          teamId: invitation.teamId,
          userId: user.id,
          role: invitation.role,
          priority: invitation.priority,
        },
      });

      // Update invitation status via raw SQL
      await tx.$queryRawUnsafe(
        'UPDATE "TeamInvitation" SET "status" = $1, "updatedAt" = NOW() WHERE "id" = $2',
        'ACCEPTED',
        invitation.id
      );
    });

    revalidatePath(`/teams/${team.slug}`);
    revalidatePath('/teams');

    return {
      success: true,
      teamSlug: team.slug,
      message: `You have successfully joined ${team.name}!`,
    };
  } catch (error: any) {
    console.error('acceptTeamInvitation Error:', error);
    return { success: false, error: error.message || 'Failed to accept invitation.' };
  }
}
