import type { Decimal } from "@prisma/client/runtime/index-browser";
import type {
  orders_payment_status,
  orders_status,
} from "../../prisma/generated/enums";
import z from "zod";

export const CREATE_ORDER_SCHEMA = z.object({
  customer_id: z.string().min(1),
  service_price_id: z.string().min(1),
  quantity: z.coerce.number().positive(),
  is_express: z.boolean().optional(),
  condition_notes: z.string().max(500).optional(),
  notes: z.string().max(500).optional(),
});

export type PostOrderRequest = {
  // order_code: string;
  customer_id: string;
  service_price_id: string;
  quantity: Decimal;
  is_express?: boolean;
  // base_price: Decimal;
  // express_surcharge?: Decimal;
  // total_price: Decimal;
  // status: orders_status;
  // payment_status: orders_payment_status;
  // is_overdue?: boolean;
  // needs_weight_label?: boolean;
  condition_notes?: string;
  notes?: string;
  // estimated_done: string;
  // created_by: string;
  // created_at: string;
  // updated_at: string;
  // picked_up_at: string;
};

export type PostOrderResponse = {
  id: string;
  order_code: string;
  customer_id: string;
  service_price_id: string;
  quantity: Decimal;
  is_express?: boolean | null;
  base_price: Decimal;
  express_surcharge?: Decimal | null;
  total_price: Decimal;
  status: orders_status;
  payment_status: orders_payment_status;
  is_overdue?: boolean | null;
  needs_weight_label?: boolean | null;
  condition_notes?: string | null;
  notes?: string | null;
  estimated_done: Date | null;
  created_by: string;
  created_at: Date | null;
  updated_at: Date | null;
  picked_up_at: Date | null;
};

export type GetAllOrdersResponse = {
  id: string;
  order_code: string;
  customer_id: string;
  service_price_id: string;
  quantity: Decimal;
  is_express?: boolean | null;
  base_price: Decimal;
  express_surcharge?: Decimal | null;
  total_price: Decimal;
  status: orders_status;
  payment_status: orders_payment_status;
  is_overdue?: boolean | null;
  needs_weight_label?: boolean | null;
  condition_notes?: string | null;
  notes?: string | null;
  estimated_done: Date | null;
  created_by: string;
  created_at: Date | null;
  updated_at: Date | null;
  picked_up_at: Date | null;
};

export type GetOrderByIdResponse = {
  id: string;
  order_code: string;
  customer_id: string;
  service_price_id: string;
  quantity: Decimal;
  is_express?: boolean | null;
  base_price: Decimal;
  express_surcharge?: Decimal | null;
  total_price: Decimal;
  status: orders_status;
  payment_status: orders_payment_status;
  is_overdue?: boolean | null;
  needs_weight_label?: boolean | null;
  condition_notes?: string | null;
  notes?: string | null;
  estimated_done: Date | null;
  created_by: string;
  created_at: Date | null;
  updated_at: Date | null;
  picked_up_at: Date | null;
};

export type UpdateOrderResponse = {
  id: string;
  order_code: string;
  customer_id: string;
  service_price_id: string;
  quantity: Decimal;
  is_express?: boolean | null;
  base_price: Decimal;
  express_surcharge?: Decimal | null;
  total_price: Decimal;
  status: orders_status;
  payment_status: orders_payment_status;
  is_overdue?: boolean | null;
  needs_weight_label?: boolean | null;
  condition_notes?: string | null;
  notes?: string | null;
  estimated_done: Date | null;
  created_by: string;
  created_at: Date | null;
  updated_at: Date | null;
  picked_up_at: Date | null;
};
