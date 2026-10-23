import React from 'react';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { DashboardLayoutClient } from '@/components/dashboard/dashboard-layout-client';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect('/login');
  }

  // Fetch real user from PostgreSQL Prisma DB
  const user = await db.user.findUnique({
    where: { email: session.user.email },
    include: { profile: true },
  });

  if (!user) {
    redirect('/login');
  }

  let profile = user.profile;
  if (!profile) {
    const baseUsername = (user.name || user.email.split('@')[0])
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || 'user';

    let chosenUsername = baseUsername;
    const existing = await db.profile.findUnique({ where: { username: chosenUsername } });
    if (existing) {
      chosenUsername = `${baseUsername}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    try {
      profile = await db.profile.create({
        data: {
          userId: user.id,
          username: chosenUsername,
          bio: 'Welcome to my scheduling page! Pick a time that works best for you.',
        },
      });
    } catch {
      profile = await db.profile.findFirst({ where: { userId: user.id } });
    }
  }

  const userData = {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
    username: profile?.username || 'user',
  };

  return (
    <DashboardLayoutClient user={userData}>
      {children}
    </DashboardLayoutClient>
  );
}