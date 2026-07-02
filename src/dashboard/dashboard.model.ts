import type { Decimal } from "@prisma/client/runtime/index-browser";
import type {
  orders_payment_status,
  orders_status,
} from "../../prisma/generated/enums";

export type Stats = {
  stats: {
    todayOrders: number;
    todayRevenue: number;
    pendingPickup: number;
    overdueOrders: number;
  };
  recentOrders: {
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
    service_prices: {
      name: string;
    };
    customers: {
      name: string;
      phone: string;
    };
  }[];
};

export type income = {
  income: number;
}[];

export type avgDay = {
  [key: string]: {
    avg_day: number;
  };
};

export type ordersDayCount = {
  order_day: number;
  customer_id: string;
}[];

export type incomeService = {
  id: string;
  service_name: string;
  total_order: number;
  total_revenue: number;
}[];

export type ordersWeek = {
  date_: Date;
  order_count: number;
}[];

export type serviceCounts = {
  service_name: string;
  jumlah: number;
}[];

export type ordersCountDayResponse = {
  data: {
    customer_id: string;
    order_day: number;
  }[];
  total: number;
};

export type serviceCountResponse = {
  service_name: string;
  jumlah: number;
}[];

export type order7daysResponse = {
  date: string | undefined;
  count: number;
}[];

export type incomeServiceResponse = {
  id: string;
  service_name: string;
  total_order: number;
  total_revenue: number;
}[];
