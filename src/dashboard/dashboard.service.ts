import { prisma } from "@/db";
import type { Stats } from "./dashboard.model";

export const DashboardService = {
  async stats(): Promise<Stats> {
    const now = new Date();

    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 59);

    const [todayStats, pendingCount, overdueCount, recentOrders] =
      await Promise.all([
        prisma.orders.aggregate({
          where: {
            created_at: { gte: todayStart, lte: todayEnd },
          },
          _count: { id: true },
          _sum: { total_price: true },
        }),

        prisma.orders.count({
          where: { status: "ready" },
        }),

        prisma.orders.count({
          where: {
            is_overdue: true,
            status: { not: "picked_up" },
          },
        }),

        prisma.orders.findMany({
          take: 10,
          orderBy: { created_at: "desc" },
          include: {
            service_prices: { select: { name: true } },
            customers: { select: { name: true, phone: true } },
          },
        }),
      ]);
    return {
      stats: {
        todayOrders: todayStats._count.id,
        todayRevenue: Number(todayStats._sum.total_price || 0),
        pendingPickup: pendingCount,
        overdueOrders: overdueCount,
      },
      recentOrders: recentOrders,
    };
  },
};
