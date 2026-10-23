import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function MePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect('/login');
  }

  const user = await db.user.findUnique({
    where: { email: session.user.email },
    include: { profile: true },
  });

  if (!user) {
    redirect('/login');
  }

  let username = user.profile?.username;

  if (!username) {
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
      const created = await db.profile.create({
        data: {
          userId: user.id,
          username: chosenUsername,
          bio: 'Welcome to my scheduling page! Pick a time that works best for you.',
        },
      });
      username = created.username;
    } catch {
      const existingProf = await db.profile.findFirst({ where: { userId: user.id } });
      username = existingProf?.username || chosenUsername;
    }
  }

  redirect(`/${username}`);
}
