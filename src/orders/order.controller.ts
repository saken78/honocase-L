import { Hono, type Context } from "hono";
import { HTTPException } from "hono/http-exception";
import type { JWT_RESPONSE } from "../auth/auth.model";
import { HttpStatus } from "../lib/status_code";
import { AuthMiddleware } from "../middleware/auth.middleware";
import { OrderService } from "./order.service";
import { parsePagination } from "../lib/types";
import { UPDATE_ORDER_STATUS_SCHEMA } from "./order.model";

const OrderController = new Hono();
OrderController.use(AuthMiddleware);

OrderController.get("/", async (c: Context) => {
  const data = await OrderService.getAllOrders();
  return c.json(
    {
      data: data,
    },
    HttpStatus.OK,
  );
});

OrderController.post("/", async (c: Context) => {
  const body = await c.req.json();
  const user: JWT_RESPONSE = c.get("user");
  const data = await OrderService.postOrder(body, user);
  return c.json(
    {
      data: data,
    },
    HttpStatus.CREATED,
  );
});

OrderController.get("/all", async (c: Context) => {
  let take: number = Number(c.req.query("take"));
  let page: number = Number(c.req.query("page"));

  const pg = parsePagination(page, take);
  const data = await OrderService.getAllOrdersJoin(pg.take, pg.page);
  return c.json(
    {
      ...data,
    },
    HttpStatus.OK,
  );
});

OrderController.get("/status", async (c: Context) => {
  let query_status = c.req.query("status");
  let query_day = c.req.query("day");
  if (!query_status) {
    query_status = "all";
  }
  if (!query_day) {
    query_day = "9999";
  }
  let take: number = Number(c.req.query("take"));
  let page: number = Number(c.req.query("page"));

  const pg = parsePagination(page, take);
  const status: string = query_status;
  const day: number = Number(query_day);
  const data = await OrderService.getAllOrdersJoinStatus(
    status,
    day,
    pg.take,
    pg.page,
  );
  return c.json(
    {
      ...data,
    },
    HttpStatus.OK,
  );
});

OrderController.get("/percentage", async (c: Context) => {
  const data = await OrderService.percentageDiffTotal();
  return c.json(
    {
      data: data,
    },
    HttpStatus.OK,
  );
});

OrderController.get("/countorders", async (c: Context) => {
  const data = await OrderService.countOrdersYesterday();
  return c.json(
    {
      data: data,
    },
    HttpStatus.OK,
  );
});

OrderController.get("/dailyrevenue", async (c: Context) => {
  const day = c.req.query("day");
  if (!day) {
    throw new HTTPException(HttpStatus.BAD_REQUEST, {
      message: "Query param undefined",
    });
  }
  const data = await OrderService.dailyRevenue(day);
  return c.json(
    {
      data: data,
    },
    HttpStatus.OK,
  );
});

OrderController.get("/express", async (c: Context) => {
  const data = await OrderService.getOrderExpress();
  return c.json(
    {
      data: data,
    },
    HttpStatus.OK,
  );
});

OrderController.get("/overdue", async (c: Context) => {
  const data = await OrderService.getOrderOverdue();
  return c.json(
    {
      data: data,
    },
    HttpStatus.OK,
  );
});

OrderController.get("/:id", async (c: Context) => {
  const id = c.req.param("id");
  if (!id) {
    throw new HTTPException(HttpStatus.BAD_REQUEST, {
      message: "Param id undefined",
    });
  }
  const data = await OrderService.getOrderById(id);
  return c.json(
    {
      data: data,
    },
    HttpStatus.OK,
  );
});

OrderController.put("/:id", async (c: Context) => {
  const id = c.req.param("id");
  if (!id) {
    throw new HTTPException(HttpStatus.BAD_REQUEST, {
      message: "Param id undefined",
    });
  }
  const body = await c.req.json();
  const validated = UPDATE_ORDER_STATUS_SCHEMA.parse(body);
  const user: JWT_RESPONSE = c.get("user");
  const data = await OrderService.updateStatusOrder(
    id,
    validated.status,
    user.id,
  );
  return c.json(
    {
      data: data,
    },
    HttpStatus.OK,
  );
});

OrderController.delete("/:id", async (c: Context) => {
  const id = c.req.param("id");
  if (!id) {
    throw new HTTPException(HttpStatus.BAD_REQUEST, {
      message: "Param id undefined",
    });
  }
  await OrderService.deleteOrder(id);
  return c.json(
    {
      data: "Delete order successfully",
    },
    HttpStatus.OK,
  );
});

export default OrderController;
