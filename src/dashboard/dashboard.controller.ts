import { AuthMiddleware } from "@/middleware/auth.middleware";
import { Hono, type Context } from "hono";
import { DashboardService } from "./dashboard.service";
import { HttpStatus } from "@/lib/status_code";
import { HTTPException } from "hono/http-exception";

const DashboardController = new Hono();
DashboardController.use(AuthMiddleware);

DashboardController.get("/stats", async (c: Context) => {
  const data = await DashboardService.stats();
  return c.json({
    data: {
      stats: {
        todayOrders: data.stats.todayOrders,
        todayRevenue: data.stats.todayRevenue,
        pendingPickup: data.stats.pendingPickup,
        overdueOrders: data.stats.overdueOrders,
      },
      recentOrders: data.recentOrders,
    },
  });
});

DashboardController.get("/income", async (c: Context) => {
  const day = c.req.query("day");
  if (!day) {
    throw new HTTPException(HttpStatus.BAD_REQUEST, {
      message: "query param undefined",
    });
  }
  const data = await DashboardService.income(day);
  return c.json({
    data: data,
    status_code: HttpStatus.OK,
  });
});

DashboardController.get("/avgday", async (c: Context) => {
  const day = c.req.query("day");
  if (!day) {
    throw new HTTPException(HttpStatus.BAD_REQUEST, {
      message: "query param undefined",
    });
  }
  const data = await DashboardService.avgDay(day);
  return c.json({
    data: data,
    status_code: HttpStatus.OK,
  });
});

DashboardController.get("/incomeservice", async (c: Context) => {
  const day = c.req.query("day");
  if (!day) {
    throw new HTTPException(HttpStatus.BAD_REQUEST, {
      message: "query not found",
    });
  }
  const data = await DashboardService.incomeService(day);
  return c.json({
    data: data,
  });
});

DashboardController.get("/orderweek", async (c: Context) => {
  const data = await DashboardService.order7days();
  return c.json({
    data: data,
  });
});

DashboardController.get("/servicecount", async (c: Context) => {
  const data = await DashboardService.orderPerService();
  return c.json({
    data: data,
  });
});

DashboardController.get("/orderscountday", async (c: Context) => {
  const day = c.req.query("day");
  if (!day) {
    throw new HTTPException(HttpStatus.BAD_REQUEST, {
      message: "query not found",
    });
  }
  const data = await DashboardService.ordersCountDay(day);
  return c.json({
    ...data,
  });
});

export default DashboardController;
