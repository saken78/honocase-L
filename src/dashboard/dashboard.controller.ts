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
  const qp = c.req.query("day");
  if (!qp) {
    throw new HTTPException(HttpStatus.BAD_REQUEST, {
      message: "query param undefined",
    });
  }
  const day = Number(qp);
  const data = await DashboardService.income(day);
  return c.json({
    data: {
      income: data,
    },
    status_code: HttpStatus.OK,
  });
});

DashboardController.get("/avgday", async (c: Context) => {
  const qp = c.req.query("day");
  if (!qp) {
    throw new HTTPException(HttpStatus.BAD_REQUEST, {
      message: "query param undefined",
    });
  }
  const day = Number(qp);
  const data = await DashboardService.avgDay(day);
  return c.json({
    data: {
      avg_day: data,
    },
    status_code: HttpStatus.OK,
  });
});

DashboardController.get("/incomeservice", async (c: Context) => {
  const data = await DashboardService.incomeService();
  return c.json({
    data: data,
  });
});

export default DashboardController;
