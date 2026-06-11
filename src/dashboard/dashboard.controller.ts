import { AuthMiddleware } from "@/middleware/auth.middleware";
import { Hono, type Context } from "hono";
import { DashboardService } from "./dashboard.service";

const DashboardController = new Hono();
DashboardController.use(AuthMiddleware);

DashboardController.get("/stats", async (c: Context) => {
  const data = await DashboardService.stats();
  return c.json({
    stats: {
      todayOrders: data.stats.todayOrders,
      todayRevenue: data.stats.todayRevenue,
      pendingPickup: data.stats.pendingPickup,
      overdueOrders: data.stats.overdueOrders,
    },
    recentOrders: data.recentOrders,
  });
});

export default DashboardController;
