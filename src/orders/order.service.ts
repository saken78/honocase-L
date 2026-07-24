import { HTTPException } from "hono/http-exception";
import {
  orders_payment_status,
  orders_status,
  Prisma,
} from "../../prisma/generated/client";
import type { JWT_RESPONSE } from "../auth/auth.model";
import { prisma } from "../db";
import { HttpStatus } from "../lib/status_code";
import {
  CREATE_ORDER_SCHEMA,
  type CountOrdersQuery,
  type DailyRevenue,
  type DailyRevenueResponse,
  type GetAllOrderJoinResponse,
  type OrderCodeQueryResponse,
  type OrderOverdue,
  type OrdersResponse,
  type PercentageDiffQuery,
  type PercentageOrderResponse,
  type PostOrderRequest,
  type StatusCount,
  type TotalOrders,
} from "./order.model";
import type { Pagination } from "../lib/types";

export const OrderService = {
  async getAllOrders(): Promise<OrdersResponse[]> {
    const data = await prisma.orders.findMany();
    if (!data) {
      throw new HTTPException(HttpStatus.NOT_FOUND, {
        message: "order not found",
      });
    }
    return data;
  },
  async postOrder(
    req: PostOrderRequest,
    user: JWT_RESPONSE,
  ): Promise<OrdersResponse> {
    const valid = CREATE_ORDER_SCHEMA.parse(req);
    const service = await prisma.service_prices.findUnique({
      where: { id: valid.service_price_id },
    });

    if (!service) {
      throw new HTTPException(HttpStatus.NOT_FOUND, {
        message: "Service not found",
      });
    }

    if (!user.id) {
      throw new HTTPException(HttpStatus.UNAUTHORIZED, {
        message: "UNAUTHORIZED",
      });
    }

    const min = service.price_min;
    const max = service.price_max;
    let harga_satuan = min;

    if (max) {
      if (service.pricing_type === "range" && service.price_max) {
        harga_satuan = min.plus(max).div(2);
      }
    }

    const qty = new Prisma.Decimal(valid.quantity);
    const base_price = harga_satuan.mul(qty);
    const express_surcharge = valid.is_express ? base_price.mul(1) : 0;
    const total_price = base_price.plus(express_surcharge);

    const today = new Date();
    const yearMonth = today.toISOString().slice(0, 7).replace("-", "");

    const lastOrder = await prisma.$queryRaw<
      OrderCodeQueryResponse[]
    >`select order_code from orders ORDER BY order_code DESC limit 1;`;

    const db_order_code = lastOrder[0]?.order_code || "ORD-202605-0001";

    let sequence = 1;
    const parts = db_order_code.split("-");
    if (parts.length < 3) {
      throw new Error("Invalid order code format");
    }
    const lastSeq = parseInt(parts[2]!);
    sequence = lastSeq + 1;

    const order_code = `ORD-${yearMonth}-${String(sequence).padStart(4, "0")}`;

    const estimated_done = new Date();
    const turnaround_hours = valid.is_express
      ? 8
      : service.default_turnaround_hours || 48;

    estimated_done.setHours(estimated_done.getHours() + turnaround_hours);

    const data = await prisma.orders.create({
      data: {
        order_code: order_code,
        customer_id: valid.customer_id,
        service_price_id: service.id,
        quantity: valid.quantity,
        is_express: valid.is_express ?? null,
        base_price: base_price,
        express_surcharge: express_surcharge,
        total_price: total_price,
        condition_notes: valid.condition_notes ?? null,
        notes: valid.notes ?? null,
        estimated_done: estimated_done,
        created_by: user.id,
      },
    });

    // optional: Businesses process
    if (valid.payment) {
      const paymentAmount = new Prisma.Decimal(valid.payment.amount);

      await prisma.payments.create({
        data: {
          order_id: data.id,
          method: valid.payment.method,
          amount: paymentAmount,
          paid_by: valid.payment.paid_by,
        },
      });

      const paymentStatus = paymentAmount.gte(total_price)
        ? "lunas"
        : "cicilan";

      const updated = await prisma.orders.update({
        where: { id: data.id },
        data: { payment_status: paymentStatus as orders_payment_status },
      });

      return updated;
    }

    return data;
  },
  async getAllOrdersJoin(
    many: number,
    page: number,
  ): Promise<Pagination<GetAllOrderJoinResponse[]>> {
    const ofs: number = (page - 1) * many;
    const [raw_total] = await prisma.$queryRaw<TotalOrders[]>`
select count(*) as total from orders;`;
    const total = Number(raw_total?.total);

    const data = await prisma.orders.findMany({
      select: {
        id: true,
        order_code: true,
        is_express: true,
        quantity: true,
        total_price: true,
        status: true,
        payment_status: true,
        estimated_done: true,
        created_at: true,
        express_surcharge: true,
        base_price: true,
        condition_notes: true,
        notes: true,
        picked_up_at: true,
        customers: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        service_prices: {
          select: {
            id: true,
            name: true,
            pricing_type: true,
            price_min: true,
            price_max: true,
            unit_label: true,
          },
        },
      },
      take: many,
      skip: ofs,
    });
    return {
      data: data,
      page: page,
      take: many,
      total: total,
    };
  },
  async getAllOrdersJoinStatus(
    query_status: string,
    query_day: number,
    many: number,
    page: number,
  ): Promise<Pagination<GetAllOrderJoinResponse[]>> {
    const status = query_status as orders_status;
    const ofs: number = (page - 1) * many;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - query_day);

    let data;
    const [raw_total] = await prisma.$queryRaw<StatusCount[]>`
    select o.status as status_name, count(*) as status_count
    from orders as o
    where o.status = ${status};`;
    const total = Number(raw_total?.status_count);

    const select = {
      id: true,
      order_code: true,
      is_express: true,
      quantity: true,
      total_price: true,
      status: true,
      payment_status: true,
      estimated_done: true,
      created_at: true,
      express_surcharge: true,
      base_price: true,
      condition_notes: true,
      notes: true,
      picked_up_at: true,
      customers: {
        select: {
          id: true,
          name: true,
          phone: true,
        },
      },
      service_prices: {
        select: {
          id: true,
          name: true,
          pricing_type: true,
          price_min: true,
          price_max: true,
          unit_label: true,
        },
      },
    };
    const where: Prisma.ordersWhereInput = {};

    if (query_status !== "all" && query_day !== 9999) {
      where.status = status;
      where.created_at = { gte: startDate };
    }
    if (query_status === "all" && query_day !== 9999) {
      where.created_at = { gte: startDate };
    }
    if (query_status !== "all" && query_day === 9999) {
      where.status = status;
    }

    data = await prisma.orders.findMany({
      select,
      where,
      take: many,
      skip: ofs,
    });

    return {
      data: data,
      page: page,
      take: many,
      total: total,
    };
  },
  async percentageDiffTotal(): Promise<PercentageOrderResponse> {
    const [data] = await prisma.$queryRaw<PercentageDiffQuery[]>`
select sum(
        case
            when date(created_at) = CURDATE() - interval 1 day then total_price
            else 0
        end
    ) as yesterday, sum(
        case
            when date(created_at) = curdate() then total_price
            else 0
        end
    ) as today, (
        sum(
            case
                when date(created_at) = CURDATE() then total_price
                else 0
            end
        ) - sum(
            case
                when date(created_at) = curdate() - interval 1 day then total_price
                else 0
            end
        )
    ) as diff
from orders`;
    if (!data) {
      return {
        percentage_diff: 0,
      };
    }

    const today = Number(data.today);
    const yesterday = Number(data.yesterday);

    if (today === 0 && yesterday === 0) {
      return {
        percentage_diff: 0,
      };
    }

    if (yesterday === 0) {
      return {
        percentage_diff: 100,
      };
    }

    const percentage = ((today - yesterday) / yesterday) * 100;
    const percentage_tofixed = Number(percentage.toFixed(1));

    return {
      percentage_diff: percentage_tofixed,
    };
  },
  async getOrderExpress(): Promise<number> {
    const data = await prisma.orders.count({
      where: {
        is_express: true,
      },
    });
    return data;
  },
  async getOrderOverdue(): Promise<number> {
    const [data] = await prisma.$queryRaw<OrderOverdue[]>`
    select count(*) as overdue
    from orders
    where
        payment_status = "lunas"
        and status = "ready"
        and NOW() > DATE_ADD(
            estimated_done,
            interval 30 day
        );`;
    const overdue = Number(data?.overdue);
    return overdue;
  },
  async countOrdersYesterday(): Promise<number> {
    const [data] = await prisma.$queryRaw<CountOrdersQuery[]>`
    select count(*) as yesterday, (
        select count(*)
        from orders
        where
            date(created_at) = curdate()
    ) as today
    from orders
    where
    date(created_at) = CURDATE() - interval 1 day`;
    if (!data) {
      return 0;
    }
    const diff = data.today - data.yesterday;

    return Number(diff);
  },
  async getOrderById(id: string): Promise<OrdersResponse> {
    const data = await prisma.orders.findUnique({
      where: { id: id },
    });
    if (!data) {
      throw new HTTPException(HttpStatus.NOT_FOUND, {
        message: "order not found",
      });
    }
    return data;
  },
  async updateStatusOrder(
    id: string,
    status: orders_status,
    userId: string,
  ): Promise<OrdersResponse> {
    const existing = await prisma.orders.findUnique({ where: { id: id } });
    if (!existing) {
      throw new HTTPException(HttpStatus.NOT_FOUND, {
        message: "Order with id not found",
      });
    }

    if (existing.status === "ready" && existing.payment_status !== "lunas") {
      throw new HTTPException(HttpStatus.BAD_REQUEST, {
        message: "Lengkapi pembayaran dulu",
      });
    }

    const data = await prisma.orders.update({
      where: { id: id },
      data: {
        status: status,
      },
    });

    if (!data) {
      throw new HTTPException(HttpStatus.NOT_FOUND, {
        message: "Order not found",
      });
    }

    await prisma.order_audit_log.create({
      data: {
        order_id: id,
        user_id: userId,
        old_status: existing.status,
        new_status: status,
      },
    });
    return data;
  },
  async deleteOrder(id: string): Promise<void> {
    const data = await prisma.orders.findUnique({
      where: {
        id: id,
      },
    });
    if (!data) {
      throw new HTTPException(HttpStatus.NOT_FOUND, {
        message: "Failed delete order",
      });
    }
    await prisma.orders.delete({ where: { id: id } });
  },
  async dailyRevenue(day: string): Promise<DailyRevenueResponse[]> {
    let raw;
    if (day === "all") {
      raw = await prisma.$queryRaw<DailyRevenue>`
    select date(o.created_at) as date, sum(o.total_price) as revenue, count(*) as orders
    from orders as o
    group by
      date(o.created_at)`;
    } else {
      raw = await prisma.$queryRaw<DailyRevenue>`
    select date(o.created_at) as date, sum(o.total_price) as revenue, count(*) as orders
    from orders as o
    where
      date(created_at) >= CURDATE() - interval ${day} day
    group by
      date(o.created_at)`;
    }

    const data = raw.map((od) => {
      return {
        date: new Date(od.date).toISOString().split("T")[0],
        revenue: Number(od.revenue),
        orders: Number(od.orders),
      };
    });

    return data;
  },
};
