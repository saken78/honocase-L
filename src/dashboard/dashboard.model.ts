import type { Decimal } from "@prisma/client/runtime/index-browser";
import type {
  orders_payment_status,
  orders_status,
} from "../../prisma/generated/enums";

export type DashboardStatsResponse = {
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

export type DashboardIncomeQuery = {
  income: number;
}[];

export type DashboardIncomeResponse = {
  income: number;
};

export type DashboardAvgDayQuery = {
  avg_day: number;
}[];

export type DashboardAvgDayResponse = {
  avg_day: number;
};

export type DashboardOrdersDayCountResponse = {
  order_day: number;
  customer_id: string;
}[];

export type DashboardIncomeServiceResponse = {
  id: string;
  service_name: string;
  total_order: number;
  total_revenue: number;
}[];

export type DashboardOrdersWeekResponse = {
  date_: Date;
  order_count: number;
}[];

export type DashboardOrdersCountDayResponse = {
  data: {
    customer_id: string;
    order_day: number;
  }[];
  total: number;
};

export type DashboardOrdersCountDayQuery = {
  customer_id: string;
  order_day: number;
};

export type DashboardServiceCountResponse = {
  service_name: string;
  jumlah: number;
}[];

export type DashboardOrder7daysResponse = {
  date: string | undefined;
  count: number;
}[];
