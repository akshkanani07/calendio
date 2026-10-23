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

  const userData = {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
    username: user.profile?.username,
  };

  return (
    <DashboardLayoutClient user={userData}>
      {children}
    </DashboardLayoutClient>
  );
}