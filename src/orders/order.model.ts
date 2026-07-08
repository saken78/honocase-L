import type { Decimal } from "@prisma/client/runtime/index-browser";
import type {
  orders_payment_status,
  orders_status,
  service_prices_pricing_type,
} from "../../prisma/generated/enums";
import z from "zod";

export const CREATE_ORDER_SCHEMA = z.object({
  customer_id: z.string().min(1),
  service_price_id: z.string().min(1),
  quantity: z.coerce.number().positive(),
  is_express: z.boolean().optional(),
  condition_notes: z.string().max(500).optional(),
  notes: z.string().max(500).optional(),
  payment: z
    .object({
      method: z.enum(["cash", "transfer", "qris", "ewallet"]),
      amount: z.coerce.number().positive(),
      paid_by: z.string().min(1),
    })
    .optional(),
});

export type PostOrderRequest = {
  customer_id: string;
  service_price_id: string;
  quantity: Decimal;
  is_express?: boolean;
  condition_notes?: string;
  notes?: string;
  payment?: {
    method: "cash" | "transfer" | "qris" | "ewallet";
    amount: number;
    paid_by?: string;
  };
};

export type OrdersResponse = {
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

// export type GetAllJoinOrdersResponse = {
//   id: string;
//   order_code: string;
//   customer_id: string;
//   service_price_id: string;
//   quantity: Decimal;
//   is_express?: boolean | null;
//   base_price: Decimal;
//   express_surcharge?: Decimal | null;
//   total_price: Decimal;
//   status: orders_status;
//   payment_status: orders_payment_status;
//   is_overdue?: boolean | null;
//   needs_weight_label?: boolean | null;
//   condition_notes?: string | null;
//   notes?: string | null;
//   estimated_done: Date | null;
//   created_by: string;
//   created_at: Date | null;
//   updated_at: Date | null;
//   picked_up_at: Date | null;
//   customers: {
//     id: string;
//     name: string;
//     phone: string;
//     address: string | null;
//     total_orders: number | null;
//     created_at: Date | null;
//     updated_at: Date | null;
//   };
//   service_prices: {
//     id: string;
//     name: string;
//     category: service_prices_category;
//     pricing_type: service_prices_pricing_type;
//     price_min: Decimal;
//     price_max: Decimal | null;
//     unit_label: string;
//     default_turnaround_hours: number | null;
//     is_active: boolean | null;
//     updated_at: Date | null;
//   };
// };

export type GetAllOrderJoinResponse = {
  id: string;
  order_code: string;
  customers: {
    id: string;
    name: string;
    phone: string;
  };
  service_prices: {
    id: string;
    name: string;
    pricing_type: service_prices_pricing_type;
    price_min: Decimal;
    price_max: Decimal | null;
    unit_label: string;
  };
  is_express: boolean | null;
  quantity: Decimal;
  total_price: Decimal;
  status: string;
  payment_status: string;
  estimated_done: Date | null;
  created_at: Date | null;
  express_surcharge?: Decimal | null;
  base_price: Decimal;
  condition_notes?: string | null;
};

export type OrderCodeQueryResponse = {
  order_code: string;
};

export type PercentageDiffQuery = {
  yesterday: number;
  today: number;
  diff: number;
};

export type CountOrdersQuery = {
  yesterday: number;
  today: number;
};

export type StatusCount = {
  status_name: string;
  status_count: number;
};

export type TotalOrders = {
  total: number;
};

export type DailyRevenue = {
  date: string;
  revenue: number;
  orders: number;
}[];

export type PercentageOrderResponse = {
  percentage_diff: number;
};

export type DailyRevenueResponse = {
  date: string | undefined;
  revenue: number;
  orders: number;
};
