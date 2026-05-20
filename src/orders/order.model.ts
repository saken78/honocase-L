import type { Decimal } from "@prisma/client/runtime/index-browser";
import type {
  orders_payment_status,
  orders_status,
} from "../../prisma/generated/enums";

export type PostOrder = {
  order_code: string;
  customer_id: string;
  service_price_id: string;
  quantity: Decimal;
  is_express?: boolean;
  base_price: Decimal;
  express_surcharge?: Decimal;
  total_price: Decimal;
  status: orders_status;
  payment_status: orders_payment_status;
  is_overdue?: boolean;
  needs_weight_label?: boolean;
  condition_notes?: string;
  notes?: string;
  estimated_done: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  picked_up_at: string;
};
