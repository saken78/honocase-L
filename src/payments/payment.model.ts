import type { Decimal } from "@prisma/client/runtime/index-browser";
import type { payments_method } from "../../prisma/generated/enums";
import z from "zod";

export const RECORD_PAYMENT_SCHEMA = z.object({
  order_id: z.string().min(1),
  method: z.enum(["cash", "transfer", "qris", "ewallet"]),
  amount: z.coerce.number().positive(),
  paid_by: z.string().min(1, "paid_by wajib di isi"),
  notes: z.string().max(500).optional(),
});

export type RecordPaymentRequest = {
  order_id: string;
  method: payments_method;
  amount: number;
  paid_by: string;
  notes?: string | null;
};

export type PaymentResponse = {
  id: string;
  order_id: string;
  method: payments_method;
  amount: Decimal;
  paid_by: string;
  paid_at: Date | null;
  notes: string | null;
};

export type PaymentWithOrderResponse = PaymentResponse & {
  orders: {
    order_code: string;
    total_price: Decimal;
    payment_status: string;
    status: string;
  };
};
