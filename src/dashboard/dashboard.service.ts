import { prisma } from "@/db";
import type {
  avgDay,
  income,
  incomeService,
  ordersDayCount,
  ordersWeek,
  serviceCounts,
  Stats,
} from "./dashboard.model";

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
  async income(day: string) {
    let raw;

    if (day === "all") {
      raw = await prisma.$queryRaw<income>`
      select sum(o.total_price) as income
      from orders as o;`;
    } else {
      raw = await prisma.$queryRaw<income>`
      select sum(o.total_price) as income
      from orders as o
      where
      created_at >= NOW() - INTERVAL ${day} DAY;`;
    }

    const data =
      raw[0]?.income === null || raw[0]?.income === undefined
        ? 0
        : raw[0]?.income;
    return data;
  },
  async avgDay(day: string) {
    let raw;
    if (day === "all") {
      raw = await prisma.$queryRaw<avgDay>`
        select sum(o.total_price) as avg_day from orders as o`;
      // avg_day = total_all / number_of_days_since_first_order
      // atau bisa total / 365 (rata-rata per hari setahun)
    } else {
      raw = await prisma.$queryRaw<avgDay>`
        select sum(o.total_price) as avg_day
        from orders as o
        where created_at >= NOW() - INTERVAL ${day} DAY`;
    }

    const total = raw[0]?.avg_day ?? 0;
    const divisor = day === "all" ? 365 : Number(day);
    const avg_day = total > 0 ? total / divisor : 0;
    return avg_day;
  },
  async incomeService(day: string) {
    let raw;
    if (day === "all") {
      raw = await prisma.$queryRaw<incomeService>`
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
      raw = await prisma.$queryRaw<incomeService>`
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
  async order7days() {
    const raw = await prisma.$queryRaw<ordersWeek>`
    select date(o.created_at) as date_, count(*) as order_count
    from orders as o
    where
    date(o.created_at) >= CURDATE() - interval 7 day
    GROUP BY
    date(o.created_at);`;
    const data = raw.map((ord) => {
      return {
        date: new Date(ord.date_).toISOString().split("T")[0],
        count: Number(ord.order_count),
      };
    });
    return data;
  },
  async orderPerService() {
    const raw = await prisma.$queryRaw<serviceCounts>`
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
  async ordersCountDay(day: string) {
    let raw;
    if (day === "all") {
      raw = await prisma.$queryRaw<ordersDayCount>`
      select o.customer_id, count(*) as order_day
      from orders as o
      GROUP BY o.customer_id;`;
    } else {
      raw = await prisma.$queryRaw<ordersDayCount>`
      select o.customer_id, count(*) as order_day
      from orders as o
      where
      date(o.created_at) > curdate() - interval ${day} day
      GROUP BY o.customer_id;`;
    }

    if (!raw) {
      return 0;
    }
    const data = raw.map((ord) => {
      return {
        customer_id: ord.customer_id,
        order_day: Number(ord.order_day),
      };
    });

    let total = 0;
    if (data !== undefined) {
      for (let i = 0; i < data.length; i++) {
        total = total + data[i]!.order_day;
      }
    }

    return {
      data: data,
      total: total,
    };
  },
};
