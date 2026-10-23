const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({
    include: { profile: true }
  });

  if (!user) {
    console.log('No user found! Please register first at /register.');
    return;
  }

  console.log(`Seeding rich dummy data for user: ${user.name || user.email} (${user.id})`);

  // 1. Create/Update Event Types with luxury branding
  const eventTypesData = [
    {
      title: '30-Min Strategy Call',
      slug: '30-min-strategy-call',
      description: 'Quick alignment session to discuss product roadmap, architecture, or project scope.',
      duration: 30,
      color: '#0069FF', // Calendly Blue
      locationType: 'GOOGLE_MEET',
      schedulingType: 'ONE_ON_ONE',
      isActive: true,
    },
    {
      title: '45-Min Enterprise Product Demo',
      slug: 'enterprise-product-demo',
      description: 'Deep dive into Calendio enterprise features, team round-robin routing, and API integrations.',
      duration: 45,
      color: '#6366F1', // Indigo
      locationType: 'GOOGLE_MEET',
      schedulingType: 'ONE_ON_ONE',
      isActive: true,
    },
    {
      title: '15-Min Quick Intro / Coffee Chat',
      slug: '15-min-quick-chat',
      description: 'Casual networking and high-level sync. Perfect for first-time introductions.',
      duration: 15,
      color: '#10B981', // Emerald
      locationType: 'GOOGLE_MEET',
      schedulingType: 'ONE_ON_ONE',
      isActive: true,
    },
    {
      title: '60-Min Technical Architecture Review',
      slug: 'tech-architecture-review',
      description: 'Comprehensive code and system design consultation for engineering teams.',
      duration: 60,
      color: '#8B5CF6', // Purple
      locationType: 'GOOGLE_MEET',
      schedulingType: 'ONE_ON_ONE',
      isActive: true,
    },
  ];

  const createdEvents = [];
  for (const et of eventTypesData) {
    const existing = await prisma.eventType.findFirst({
      where: { userId: user.id, slug: et.slug }
    });
    if (existing) {
      createdEvents.push(existing);
    } else {
      const created = await prisma.eventType.create({
        data: { ...et, userId: user.id }
      });
      createdEvents.push(created);
    }
  }

  console.log(`Ensured ${createdEvents.length} event types.`);

  // 2. Realistic Bookings (Upcoming + Past for full timeline & charts)
  const now = new Date();
  
  // Future dates
  const in2Hours = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  const in2HoursEnd = new Date(in2Hours.getTime() + 30 * 60 * 1000);

  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  tomorrow.setHours(14, 0, 0, 0);
  const tomorrowEnd = new Date(tomorrow.getTime() + 45 * 60 * 1000);

  const dayAfter = new Date(now.getTime() + 48 * 60 * 60 * 1000);
  dayAfter.setHours(11, 30, 0, 0);
  const dayAfterEnd = new Date(dayAfter.getTime() + 30 * 60 * 1000);

  // Past dates
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  yesterday.setHours(15, 0, 0, 0);
  const yesterdayEnd = new Date(yesterday.getTime() + 30 * 60 * 1000);

  const past3Days = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
  past3Days.setHours(10, 0, 0, 0);
  const past3DaysEnd = new Date(past3Days.getTime() + 60 * 60 * 1000);

  const past5Days = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
  past5Days.setHours(16, 0, 0, 0);
  const past5DaysEnd = new Date(past5Days.getTime() + 30 * 60 * 1000);

  const bookingsData = [
    {
      uid: 'bkg_up_01_' + Date.now().toString(36),
      hostId: user.id,
      eventTypeId: createdEvents[0].id,
      guestName: 'Sarah Jenkins',
      guestEmail: 'sarah.jenkins@stripe.com',
      guestTimeZone: 'America/New_York',
      startTime: in2Hours,
      endTime: in2HoursEnd,
      meetingUrl: 'https://meet.google.com/xyt-qopz-mka',
      status: 'CONFIRMED',
    },
    {
      uid: 'bkg_up_02_' + Date.now().toString(36),
      hostId: user.id,
      eventTypeId: createdEvents[1].id,
      guestName: 'Alexandre Dubois',
      guestEmail: 'a.dubois@databricks.io',
      guestTimeZone: 'Europe/Paris',
      startTime: tomorrow,
      endTime: tomorrowEnd,
      meetingUrl: 'https://meet.google.com/vbc-wern-pol',
      status: 'CONFIRMED',
    },
    {
      uid: 'bkg_up_03_' + Date.now().toString(36),
      hostId: user.id,
      eventTypeId: createdEvents[2].id,
      guestName: 'Elena Rostova',
      guestEmail: 'elena@linear.app',
      guestTimeZone: 'Europe/London',
      startTime: dayAfter,
      endTime: dayAfterEnd,
      meetingUrl: 'https://meet.google.com/zxc-kuyt-wer',
      status: 'CONFIRMED',
    },
    {
      uid: 'bkg_past_01_' + Date.now().toString(36),
      hostId: user.id,
      eventTypeId: createdEvents[0].id,
      guestName: 'David Chen',
      guestEmail: 'david.chen@sequoiacap.com',
      guestTimeZone: 'America/Los_Angeles',
      startTime: yesterday,
      endTime: yesterdayEnd,
      meetingUrl: 'https://meet.google.com/abc-demo-call',
      status: 'COMPLETED',
    },
    {
      uid: 'bkg_past_02_' + Date.now().toString(36),
      hostId: user.id,
      eventTypeId: createdEvents[3].id,
      guestName: 'Priya Sharma',
      guestEmail: 'priya@zerodha.tech',
      guestTimeZone: 'Asia/Kolkata',
      startTime: past3Days,
      endTime: past3DaysEnd,
      meetingUrl: 'https://meet.google.com/def-call-sync',
      status: 'COMPLETED',
    },
    {
      uid: 'bkg_past_03_' + Date.now().toString(36),
      hostId: user.id,
      eventTypeId: createdEvents[1].id,
      guestName: 'Marcus Vance',
      guestEmail: 'marcus@vercel.com',
      guestTimeZone: 'America/New_York',
      startTime: past5Days,
      endTime: past5DaysEnd,
      meetingUrl: 'https://meet.google.com/ghi-meet-room',
      status: 'COMPLETED',
    },
  ];

  for (const b of bookingsData) {
    const existing = await prisma.booking.findFirst({
      where: { hostId: user.id, guestEmail: b.guestEmail }
    });
    if (!existing) {
      await prisma.booking.create({ data: b });
    }
  }

  console.log('Ensured rich bookings.');

  // 3. Contacts CRM with meeting count & relationship insights
  const contactsData = [
    {
      name: 'Sarah Jenkins',
      email: 'sarah.jenkins@stripe.com',
      phone: '+1 (415) 890-2341',
      company: 'Stripe, Inc.',
      totalBookings: 3,
      lastMeetingAt: in2Hours,
      tags: ['VIP Client', 'Fintech', 'Enterprise'],
      notes: 'Leading strategic partnerships. Interested in white-label scheduling integration for developer platforms.',
    },
    {
      name: 'David Chen',
      email: 'david.chen@sequoiacap.com',
      phone: '+1 (650) 420-9112',
      company: 'Sequoia Capital',
      totalBookings: 2,
      lastMeetingAt: yesterday,
      tags: ['Investor', 'Seed Stage'],
      notes: 'Discussed Q4 expansion metrics and open-source growth trajectory. Very impressed with the zero-latency scheduling UX.',
    },
    {
      name: 'Alexandre Dubois',
      email: 'a.dubois@databricks.io',
      phone: '+33 6 12 34 56 78',
      company: 'Databricks',
      totalBookings: 2,
      lastMeetingAt: tomorrow,
      tags: ['Enterprise Demo', 'EMEA'],
      notes: 'Looking for automated team round-robin routing across 20+ sales engineers.',
    },
    {
      name: 'Elena Rostova',
      email: 'elena@linear.app',
      phone: '+44 20 7946 0912',
      company: 'Linear Orbit',
      totalBookings: 1,
      lastMeetingAt: dayAfter,
      tags: ['Design Partner', 'Product'],
      notes: 'Reviewed aesthetic UI and dark mode ergonomics. Loved the micro-animations.',
    },
    {
      name: 'Priya Sharma',
      email: 'priya@zerodha.tech',
      phone: '+91 98765 43210',
      company: 'Zerodha',
      totalBookings: 4,
      lastMeetingAt: past3Days,
      tags: ['High Value', 'Advisory'],
      notes: 'Frequent collaborator on open-source TypeScript tooling.',
    },
  ];

  for (const c of contactsData) {
    const existing = await prisma.contact.findFirst({
      where: { userId: user.id, email: c.email }
    });
    if (!existing) {
      await prisma.contact.create({
        data: { ...c, userId: user.id }
      });
    }
  }

  console.log('Ensured rich CRM contacts.');

  // 4. Routing Form
  const existingForm = await prisma.routingForm.findFirst({
    where: { userId: user.id, slug: 'inbound-lead-qualification' }
  });

  if (!existingForm) {
    await prisma.routingForm.create({
      data: {
        userId: user.id,
        title: 'Enterprise Lead Screening & Routing',
        slug: 'inbound-lead-qualification',
        description: 'Qualify inbound inquiries by company size and budget to route them to the appropriate calendar link.',
        isActive: true,
        fields: [
          { id: 'f1', label: 'Company Size', type: 'select', options: ['1-10', '11-50', '50-250', '250+'] },
          { id: 'f2', label: 'Monthly Meeting Volume', type: 'select', options: ['< 50', '50 - 200', '200+'] },
        ],
        routes: [
          { id: 'r1', fieldId: 'f1', operator: 'equals', value: '250+', destinationType: 'eventType', destinationValue: 'enterprise-product-demo' },
          { id: 'r2', fieldId: 'f1', operator: 'equals', value: '1-10', destinationType: 'eventType', destinationValue: '30-min-strategy-call' },
        ],
        fallbackDestination: { type: 'eventType', value: '30-min-strategy-call' },
      }
    });
    console.log('Created routing form.');
  }

  console.log('✅ All dummy data successfully seeded into Neon PostgreSQL!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());