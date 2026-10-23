'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export type TimeRange = '7d' | '30d' | '90d' | 'year' | 'all';

export async function getAnalyticsData(timeRange: TimeRange = '30d') {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return { success: false, error: 'Unauthorized' };
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, name: true, timeZone: true },
    });

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    const now = new Date();
    let startDate = new Date();

    if (timeRange === '7d') {
      startDate.setDate(now.getDate() - 7);
    } else if (timeRange === '30d') {
      startDate.setDate(now.getDate() - 30);
    } else if (timeRange === '90d') {
      startDate.setDate(now.getDate() - 90);
    } else if (timeRange === 'year') {
      startDate.setFullYear(now.getFullYear() - 1);
    } else {
      // 'all'
      startDate = new Date(2020, 0, 1);
    }

    // Fetch all bookings for this user in the date range
    const bookings = await db.booking.findMany({
      where: {
        hostId: user.id,
        createdAt: { gte: startDate },
      },
      include: {
        eventType: {
          select: {
            id: true,
            title: true,
            duration: true,
            color: true,
            slug: true,
          },
        },
      },
      orderBy: { startTime: 'asc' },
    });

    const totalBookings = bookings.length;
    const cancelledBookings = bookings.filter((b) => b.status === 'CANCELLED').length;
    const rescheduledBookings = bookings.filter(
      (b) => b.status === 'RESCHEDULED' || b.rescheduledFrom !== null
    ).length;
    const confirmedBookings = bookings.filter(
      (b) => b.status === 'CONFIRMED' || b.status === 'COMPLETED'
    ).length;

    // Completed: confirmed and past end time
    const completedBookings = bookings.filter(
      (b) => b.status === 'COMPLETED' || (b.status === 'CONFIRMED' && new Date(b.endTime) < now)
    ).length;

    const cancellationRate = totalBookings > 0
      ? Math.round((cancelledBookings / totalBookings) * 100 * 10) / 10
      : 0;

    const rescheduleRate = totalBookings > 0
      ? Math.round((rescheduledBookings / totalBookings) * 100 * 10) / 10
      : 0;

    // Total meeting minutes
    let totalMeetingMinutes = 0;
    bookings.forEach((b) => {
      if (b.status !== 'CANCELLED') {
        const diffMs = new Date(b.endTime).getTime() - new Date(b.startTime).getTime();
        const mins = Math.max(0, Math.round(diffMs / (1000 * 60)));
        totalMeetingMinutes += mins;
      }
    });

    const totalMeetingHours = Math.round((totalMeetingMinutes / 60) * 10) / 10;

    // --- TIME SERIES TREND (Daily buckets for 7d & 30d, Weekly/Monthly for 90d+) ---
    const daysCount = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 12 : 12;
    const timeSeriesMap = new Map<string, { label: string; confirmed: number; cancelled: number; rescheduled: number }>();

    if (timeRange === '7d' || timeRange === '30d') {
      const numDays = timeRange === '7d' ? 7 : 30;
      for (let i = numDays - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        const key = d.toISOString().split('T')[0];
        const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        timeSeriesMap.set(key, { label, confirmed: 0, cancelled: 0, rescheduled: 0 });
      }

      bookings.forEach((b) => {
        const key = new Date(b.startTime).toISOString().split('T')[0];
        const entry = timeSeriesMap.get(key);
        if (entry) {
          if (b.status === 'CANCELLED') entry.cancelled++;
          else if (b.status === 'RESCHEDULED') entry.rescheduled++;
          else entry.confirmed++;
        }
      });
    } else {
      // Month buckets
      for (let i = 11; i >= 0; i--) {
        const d = new Date();
        d.setMonth(now.getMonth() - i);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const label = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        timeSeriesMap.set(key, { label, confirmed: 0, cancelled: 0, rescheduled: 0 });
      }

      bookings.forEach((b) => {
        const d = new Date(b.startTime);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const entry = timeSeriesMap.get(key);
        if (entry) {
          if (b.status === 'CANCELLED') entry.cancelled++;
          else if (b.status === 'RESCHEDULED') entry.rescheduled++;
          else entry.confirmed++;
        }
      });
    }

    const timeSeriesData = Array.from(timeSeriesMap.values());

    // --- BREAKDOWN BY EVENT TYPE ---
    const eventTypeMap = new Map<string, { id: string; title: string; color: string; count: number; minutes: number }>();

    bookings.forEach((b) => {
      if (b.eventType) {
        const existing = eventTypeMap.get(b.eventType.id);
        const diffMs = new Date(b.endTime).getTime() - new Date(b.startTime).getTime();
        const mins = Math.max(0, Math.round(diffMs / (1000 * 60)));

        if (existing) {
          existing.count++;
          existing.minutes += mins;
        } else {
          eventTypeMap.set(b.eventType.id, {
            id: b.eventType.id,
            title: b.eventType.title,
            color: b.eventType.color || '#0069FF',
            count: 1,
            minutes: mins,
          });
        }
      }
    });

    const eventTypesBreakdown = Array.from(eventTypeMap.values())
      .map((item) => ({
        ...item,
        percentage: totalBookings > 0 ? Math.round((item.count / totalBookings) * 100) : 0,
        hours: Math.round((item.minutes / 60) * 10) / 10,
      }))
      .sort((a, b) => b.count - a.count);

    // --- DAY OF WEEK DISTRIBUTION (Mon - Sun) ---
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayDistribution = [
      { day: 'Mon', count: 0 },
      { day: 'Tue', count: 0 },
      { day: 'Wed', count: 0 },
      { day: 'Thu', count: 0 },
      { day: 'Fri', count: 0 },
      { day: 'Sat', count: 0 },
      { day: 'Sun', count: 0 },
    ];

    bookings.forEach((b) => {
      const d = new Date(b.startTime);
      const name = dayNames[d.getDay()];
      const found = dayDistribution.find((x) => x.day === name);
      if (found) found.count++;
    });

    let busiestDay = 'None';
    let maxDayCount = 0;
    dayDistribution.forEach((d) => {
      if (d.count > maxDayCount) {
        maxDayCount = d.count;
        busiestDay = d.day;
      }
    });

    // --- TIME OF DAY DISTRIBUTION ---
    let morningCount = 0; // < 12 PM
    let afternoonCount = 0; // 12 PM - 5 PM
    let eveningCount = 0; // > 5 PM

    bookings.forEach((b) => {
      const hour = new Date(b.startTime).getHours();
      if (hour < 12) morningCount++;
      else if (hour < 17) afternoonCount++;
      else eveningCount++;
    });

    // --- TOP ATTENDEES ---
    const attendeeMap = new Map<string, { name: string; email: string; count: number }>();
    bookings.forEach((b) => {
      const email = b.guestEmail.toLowerCase().trim();
      const existing = attendeeMap.get(email);
      if (existing) {
        existing.count++;
      } else {
        attendeeMap.set(email, {
          name: b.guestName,
          email,
          count: 1,
        });
      }
    });

    const topAttendees = Array.from(attendeeMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      success: true,
      timeRange,
      kpis: {
        totalBookings,
        confirmedBookings,
        completedBookings,
        cancelledBookings,
        rescheduledBookings,
        cancellationRate,
        rescheduleRate,
        totalMeetingMinutes,
        totalMeetingHours,
        busiestDay,
      },
      timeSeriesData,
      eventTypesBreakdown,
      dayDistribution,
      timeOfDay: {
        morning: morningCount,
        afternoon: afternoonCount,
        evening: eveningCount,
      },
      topAttendees,
    };
  } catch (error: any) {
    console.error('getAnalyticsData Error:', error);
    return { success: false, error: error.message };
  }
}
