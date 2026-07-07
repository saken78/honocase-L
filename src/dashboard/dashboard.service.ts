import { prisma } from "../db/";
import type {
  DashboardStatsResponse,
  DashboardIncomeQuery,
  DashboardIncomeServiceResponse,
  DashboardOrder7daysResponse,
  DashboardOrdersCountDayResponse,
  DashboardOrdersWeekResponse,
  DashboardServiceCountResponse,
  DashboardIncomeResponse,
  DashboardAvgDayQuery,
  DashboardAvgDayResponse,
  DashboardOrdersCountDayQuery,
} from "./dashboard.model";

export const DashboardService = {
  async stats(): Promise<DashboardStatsResponse> {
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
  async income(day: string): Promise<DashboardIncomeResponse> {
    let raw;

    if (day === "all") {
      raw = await prisma.$queryRaw<DashboardIncomeQuery>`
      select sum(o.total_price) as income
      from orders as o;`;
    } else {
      raw = await prisma.$queryRaw<DashboardIncomeQuery>`
      select sum(o.total_price) as income
      from orders as o
      where
      created_at >= NOW() - INTERVAL ${day} DAY;`;
    }

    const data =
      raw[0]?.income === null || raw[0]?.income === undefined
        ? 0
        : raw[0]?.income;
    return {
      income: data,
    };
  },
  async avgDay(day: string): Promise<DashboardAvgDayResponse> {
    let raw;

    if (day === "all") {
      raw = await prisma.$queryRaw<DashboardAvgDayQuery>`
        select sum(o.total_price) as avg_day from orders as o`;
    } else {
      raw = await prisma.$queryRaw<DashboardAvgDayQuery>`
        select sum(o.total_price) as avg_day
        from orders as o
        where created_at >= NOW() - INTERVAL ${day} DAY`;
    }

    const total = raw[0]?.avg_day ?? 0;
    const divisor = day === "all" ? 365 : Number(day);
    const avg_day = total > 0 ? total / divisor : 0;
    return {
      avg_day: avg_day,
    };
  },
  async incomeService(day: string): Promise<DashboardIncomeServiceResponse> {
    let raw;
    if (day === "all") {
      raw = await prisma.$queryRaw<DashboardIncomeServiceResponse>`
        select
        sp.id as service_id,
        sp.name as service_name,
        count(*) as total_order,
        COALESCE(sum(o.total_price), 0) as total_revenue
      from
        service_prices as sp
        left join orders as o on o.service_price_id = sp.id
      group by
        sp.id,
        sp.name
      order by total_revenue desc;`;
    } else {
      raw = await prisma.$queryRaw<DashboardIncomeServiceResponse>`
        select
        sp.id as service_id,
        sp.name as service_name,
        count(*) as total_order,
        COALESCE(sum(o.total_price), 0) as total_revenue
      from
        service_prices as sp
        left join orders as o on o.service_price_id = sp.id
        and date(o.created_at) > CURDATE() - interval ${day} DAY
      group by
        sp.id,
        sp.name
      order by total_revenue desc;`;
    }

    const data = raw.map((c) => {
      return {
        id: c.id,
        service_name: c.service_name,
        total_order: Number(c.total_order),
        total_revenue: c.total_revenue,
      };
    });
    return data;
  },
  async order7days(): Promise<DashboardOrder7daysResponse> {
    const raw = await prisma.$queryRaw<DashboardOrdersWeekResponse>`
    SELECT DATE(o.created_at) AS date_, COUNT(*) AS order_count
    FROM orders as o
    WHERE DATE(o.created_at) >= CURDATE() - INTERVAL 6 DAY 
    GROUP BY DATE(o.created_at);`;

    const lookup = new Map(
      raw.map((r) => [
        new Date(r.date_).toISOString().split("T")[0],
        Number(r.order_count),
      ]),
    );

    const result: DashboardOrder7daysResponse = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const key = date.toISOString().split("T")[0];
      result.push({ date: key, count: lookup.get(key) ?? 0 });
    }

    return result;
  },
  async orderPerService(): Promise<DashboardServiceCountResponse> {
    const raw = await prisma.$queryRaw<DashboardServiceCountResponse>`
    select sp.name as service_name, count(*) as jumlah
    from orders as o
        join service_prices as sp on sp.id = o.service_price_id
    group by
        sp.id,
        sp.name; `;
    const data = raw.map((ord) => {
      return {
        service_name: ord.service_name,
        jumlah: Number(ord.jumlah),
      };
    });
    return data;
  },
  async ordersCountDay(day: string): Promise<DashboardOrdersCountDayResponse> {
    let raw;
    if (day === "all") {
      raw = await prisma.$queryRaw<DashboardOrdersCountDayQuery[]>`
      select o.customer_id, count(*) as order_day
      from orders as o
      GROUP BY o.customer_id;`;
    } else {
      raw = await prisma.$queryRaw<DashboardOrdersCountDayQuery[]>`
      select o.customer_id, count(*) as order_day
      from orders as o
      where
      date(o.created_at) > curdate() - interval ${day} day
      GROUP BY o.customer_id;`;
    }

    const data = raw.map((ord: DashboardOrdersCountDayQuery) => {
      return {
        customer_id: ord.customer_id,
        order_day: Number(ord.order_day),
      };
    });

    let total = 0;
    for (let i = 0; i < data.length; i++) {
      total = total + data[i]!.order_day;
    }

    return {
      data: data,
      total: total,
    };
  },
};
