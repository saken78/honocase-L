import { HTTPException } from "hono/http-exception";
import { orders_status, Prisma } from "../../prisma/generated/client";
import type { JWT_RESPONSE } from "../auth/auth.model";
import { prisma } from "../db";
import { HttpStatus } from "../lib/status_code";
import {
  CREATE_ORDER_SCHEMA,
  type CountOrdersQuery,
  type GetAllOrderJoinCleanResponse,
  type GetAllOrdersResponse,
  type GetOrderByIdResponse,
  type OrderCodeQueryResponse,
  type Pagination,
  type PercentageDiffQuery,
  type PostOrderRequest,
  type PostOrderResponse,
  type StatusCount,
  type TotalOrders,
  type UpdateOrderResponse,
} from "./order.model";

const OrderService = {
  async getAllOrders(): Promise<GetAllOrdersResponse[]> {
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
  ): Promise<PostOrderResponse> {
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

    console.log(db_order_code);

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

    return data;
  },
  async getAllOrdersJoin(
    many: number,
    page: number,
  ): Promise<Pagination<GetAllOrderJoinCleanResponse[]>> {
    const ofs: number = (page - 1) * many;
    const [raw_total] = await prisma.$queryRaw<TotalOrders[]>`
select count(*) as total from orders;
`;
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
  ): Promise<Pagination<GetAllOrderJoinCleanResponse[] | undefined>> {
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

    if (query_status !== "all" && query_day !== 9999) {
      data = await prisma.orders.findMany({
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
        where: {
          status: status,
          created_at: {
            gte: startDate,
          },
        },
      });
    } else if (query_status === "all" && query_day !== 9999) {
      data = await prisma.orders.findMany({
        where: {
          created_at: {
            gte: startDate,
          },
        },
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
    } else if (query_status !== "all" && query_day === 9999) {
      data = await prisma.orders.findMany({
        where: {
          status: status,
        },
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
    }
    return {
      data: data,
      page: page,
      take: many,
      total: total,
    };
  },

  async percentageDiffTotal() {
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

    const data_diff = Number(data.diff);
    const data_today = Number(data.today);
    const data_yesterday = Number(data.yesterday);

    if (data_today === 0 && data_yesterday === 0) {
      return {
        percentage_diff: 0,
      };
    }

    const diff = (data_diff / data_yesterday) * 100;
    return {
      percentage_diff: diff,
    };
  },

  async countOrdersYesterday(): Promise<number> {
    const [data] = await prisma.$queryRaw<CountOrdersQuery[]>`
select count(*) as jumlah_order
from orders
where
    date(created_at) = CURDATE() - interval 1 day`;
    if (!data) {
      return 0;
    }
    return Number(data.jumlah_order);
  },

  async getOrderById(id: string): Promise<GetOrderByIdResponse> {
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
  ): Promise<UpdateOrderResponse> {
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
    return data;
  },
};

export default OrderService;
