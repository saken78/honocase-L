import type { JWT_RESPONSE } from "../auth/auth.model";
import { prisma } from "../db";
import { HttpStatus } from "../lib/status_code";
import { HTTPException } from "hono/http-exception";
import { orders_status, Prisma } from "../../prisma/generated/client";
import {
  CREATE_ORDER_SCHEMA,
  type GetAllOrdersResponse,
  type GetOrderByIdResponse,
  type PostOrderRequest,
  type PostOrderResponse,
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

    const lastOrder = await prisma.orders.findFirst({
      select: { order_code: true },
      orderBy: { id: "desc" },
    });

    const db_order_code = lastOrder?.order_code || "ORD-202605-0001";

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
  async getAllOrdersJoin() {
    const data = await prisma.orders.findMany({
      include: {
        customers: true,
        service_prices: true,
      },
    });
    return data;
  },
  async getAllOrdersJoinStatus(queryparam: string) {
    const query = queryparam as orders_status;
    console.log(query);
    const data = await prisma.orders.findMany({
      where: {
        status: query,
      },
      include: {
        customers: true,
        service_prices: true,
      },
    });
    return data;
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
