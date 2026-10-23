'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export interface GlobalSearchResult {
  id: string;
  title: string;
  subtitle: string;
  category: 'Event Types' | 'Bookings' | 'Contacts' | 'Workflows' | 'Routing';
  href: string;
}

export async function searchGlobalEntities(query: string): Promise<GlobalSearchResult[]> {
  try {
    const q = query.trim().toLowerCase();
    if (!q || q.length < 2) return [];

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return [];

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, profile: { select: { username: true } } },
    });

    if (!user) return [];

    const username = user.profile?.username || 'me';

    const [eventTypes, bookings, contacts, automations] = await Promise.all([
      // 1. Search Event Types
      db.eventType.findMany({
        where: {
          userId: user.id,
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { slug: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: 5,
        select: { id: true, title: true, slug: true, duration: true },
      }),

      // 2. Search Bookings
      db.booking.findMany({
        where: {
          hostId: user.id,
          OR: [
            { guestName: { contains: q, mode: 'insensitive' } },
            { guestEmail: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: 5,
        orderBy: { startTime: 'desc' },
        select: { id: true, guestName: true, guestEmail: true, startTime: true, eventType: { select: { title: true } } },
      }),

      // 3. Search Contacts
      db.contact.findMany({
        where: {
          userId: user.id,
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { email: { contains: q, mode: 'insensitive' } },
            { company: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: 5,
        select: { id: true, name: true, email: true, company: true },
      }),

      // 4. Search Workflows
      db.automation.findMany({
        where: {
          userId: user.id,
          name: { contains: q, mode: 'insensitive' },
        },
        take: 3,
        select: { id: true, name: true, trigger: true },
      }),
    ]);

    // Optional: Search Routing Forms via SQL raw to avoid DLL lock
    let routingForms: any[] = [];
    try {
      routingForms = await db.$queryRawUnsafe<any[]>(
        'SELECT id, title, slug FROM "RoutingForm" WHERE "userId" = $1 AND LOWER(title) LIKE $2 LIMIT 3',
        user.id,
        `%${q}%`
      );
    } catch (e) {
      // ignore
    }

    const results: GlobalSearchResult[] = [];

    eventTypes.forEach((et: any) => {
      results.push({
        id: `et-${et.id}`,
        title: et.title,
        subtitle: `${et.duration} mins • /${username}/${et.slug}`,
        category: 'Event Types',
        href: `/event-types`,
      });
    });

    bookings.forEach((b: any) => {
      const dateStr = new Date(b.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      results.push({
        id: `bk-${b.id}`,
        title: `${b.guestName} (${b.eventType?.title || 'Meeting'})`,
        subtitle: `${b.guestEmail} • ${dateStr}`,
        category: 'Bookings',
        href: `/bookings`,
      });
    });

    contacts.forEach((c: any) => {
      results.push({
        id: `ct-${c.id}`,
        title: c.name,
        subtitle: `${c.email}${c.company ? ` • ${c.company}` : ''}`,
        category: 'Contacts',
        href: `/contacts`,
      });
    });

    automations.forEach((a: any) => {
      results.push({
        id: `auto-${a.id}`,
        title: a.name,
        subtitle: `Trigger: ${a.trigger}`,
        category: 'Workflows',
        href: `/automations`,
      });
    });

    routingForms.forEach((rf: any) => {
      results.push({
        id: `rf-${rf.id}`,
        title: rf.title,
        subtitle: `Routing Form • /forms/${rf.slug}`,
        category: 'Routing',
        href: `/routing`,
      });
    });

    return results;
  } catch (error) {
    console.error('searchGlobalEntities Error:', error);
    return [];
  }
}
