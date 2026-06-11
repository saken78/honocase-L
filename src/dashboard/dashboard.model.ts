export type Stats = {
  stats: {
    todayOrders: number;
    todayRevenue: number;
    pendingPickup: number;
    overdueOrders: number;
  };
  recentOrders: {
    service_prices: {
      name: string;
    };
    customers: {
      name: string;
      phone: string;
    };
  };
};
