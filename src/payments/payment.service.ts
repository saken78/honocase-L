import { HTTPException } from "hono/http-exception";
import { orders_payment_status, Prisma } from "../../prisma/generated/client";
import { prisma } from "../db";
import { HttpStatus } from "../lib/status_code";
import {
  RECORD_PAYMENT_SCHEMA,
  type PaymentResponse,
  type PaymentWithOrderResponse,
  type RecordPaymentRequest,
} from "./payment.model";

export const PaymentService = {
  async recordPayment(req: RecordPaymentRequest): Promise<PaymentResponse> {
    const valid = RECORD_PAYMENT_SCHEMA.parse(req);
    const order = await prisma.orders.findUnique({
      where: { id: valid.order_id },
      select: { id: true, total_price: true, payment_status: true },
    });

    if (!order) {
      throw new HTTPException(HttpStatus.NOT_FOUND, {
        message: "Order not found",
      });
    }

    const amount = new Prisma.Decimal(valid.amount);

    const payment = await prisma.payments.create({
      data: {
        order_id: valid.order_id,
        method: valid.method,
        amount: amount,
        paid_by: valid.paid_by,
        notes: valid.notes ?? "",
      },
    });

    const [aggregated] = await prisma.$queryRaw<
      { total_paid: number | null }[]
    >`select coalesce(sum(amount), 0) as total_paid from payments where order_id = ${valid.order_id}`;

    const totalPaid = new Prisma.Decimal(aggregated?.total_paid ?? 0);
    const totalPrice = order.total_price;
    let newPaymentStatus: orders_payment_status;

    if (totalPaid.gte(totalPrice)) {
      newPaymentStatus = "lunas";
    } else if (totalPaid.gt(0)) {
      newPaymentStatus = "cicilan";
    } else {
      newPaymentStatus = "pending";
    }

    await prisma.orders.update({
      where: { id: valid.order_id },
      data: { payment_status: newPaymentStatus },
    });

    return payment;
  },

  async getPaymentsByOrderId(
    orderId: string,
    many: number,
    page: number,
  ): Promise<{
    data: PaymentWithOrderResponse[];
    page: number;
    take: number;
    total: number;
  }> {
    const ofs = (page - 1) * many;

    const [rawTotal] = await prisma.$queryRaw<{ total: number }[]>`
      select count(*) as total from payments where order_id = ${orderId}
    `;
    const total = Number(rawTotal?.total);

    const data = await prisma.payments.findMany({
      where: { order_id: orderId },
      select: {
        id: true,
        order_id: true,
        method: true,
        amount: true,
        paid_by: true,
        paid_at: true,
        notes: true,
        orders: {
          select: {
            order_code: true,
            total_price: true,
            payment_status: true,
            status: true,
          },
        },
      },
      take: many,
      skip: ofs,
      orderBy: { paid_at: "desc" },
    });

    return { data, page, take: many, total };
  },

  async getAllPayments(
    many: number,
    page: number,
  ): Promise<{
    data: PaymentWithOrderResponse[];
    page: number;
    take: number;
    total: number;
  }> {
    const ofs = (page - 1) * many;

    const [rawTotal] = await prisma.$queryRaw<{ total: number }[]>`
      select count(*) as total from payments
    `;
    const total = Number(rawTotal?.total);

    const data = await prisma.payments.findMany({
      select: {
        id: true,
        order_id: true,
        method: true,
        amount: true,
        paid_by: true,
        paid_at: true,
        notes: true,
        orders: {
          select: {
            order_code: true,
            total_price: true,
            payment_status: true,
            status: true,
          },
        },
      },
      take: many,
      skip: ofs,
      orderBy: { paid_at: "desc" },
    });

    return { data, page, take: many, total };
  },

  async getPaymentById(id: string): Promise<PaymentWithOrderResponse> {
    const data = await prisma.payments.findUnique({
      where: { id },
      select: {
        id: true,
        order_id: true,
        method: true,
        amount: true,
        paid_by: true,
        paid_at: true,
        notes: true,
        orders: {
          select: {
            order_code: true,
            total_price: true,
            payment_status: true,
            status: true,
          },
        },
      },
    });

    if (!data) {
      throw new HTTPException(HttpStatus.NOT_FOUND, {
        message: "Payment not found",
      });
    }

    return data;
  },
};
