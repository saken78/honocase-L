import { Hono, type Context } from "hono";
import { HTTPException } from "hono/http-exception";
import type { JWT_PAYLOAD, JWT_RESPONSE } from "../auth/auth.model";
import { HttpStatus } from "../lib/status_code";
import { AuthMiddleware } from "../middleware/auth.middleware";
import OrderService from "./order.service";

const OrderController = new Hono();
OrderController.use(AuthMiddleware);

OrderController.get("/", async (c: Context) => {
  const data = await OrderService.getAllOrders();
  return c.json({
    data: data,
    status_code: HttpStatus.OK,
  });
});

OrderController.post("/", async (c: Context) => {
  const body = await c.req.json();
  const user: JWT_RESPONSE = c.get("user");
  const data = await OrderService.postOrder(body, user);
  return c.json({
    data: data,
    status_code: HttpStatus.CREATED,
  });
});

OrderController.get("/all", async (c: Context) => {
  let take: number = Number(c.req.query("take"));
  let page: number = Number(c.req.query("page"));

  page = isNaN(page) ? 1 : page;
  take = isNaN(take) ? 10 : take;

  if (page === undefined) {
    page = isNaN(page) ? 1 : page;
  }

  if (take === undefined) {
    take = isNaN(take) ? 10 : take;
  }
  const data = await OrderService.getAllOrdersJoin(take, page);
  return c.json({
    ...data,
    status_code: HttpStatus.OK,
  });
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

  page = isNaN(page) ? 1 : page;
  take = isNaN(take) ? 10 : take;

  if (page === undefined) {
    page = isNaN(page) ? 1 : page;
  }

  if (take === undefined) {
    take = isNaN(take) ? 10 : take;
  }
  const status: string = query_status;
  const day: number = Number(query_day);
  const data = await OrderService.getAllOrdersJoinStatus(
    status,
    day,
    take,
    page,
  );
  return c.json({
    ...data,
    status_code: HttpStatus.OK,
  });
});

OrderController.get("percentage", async (c: Context) => {
  const data = await OrderService.percentageDiffTotal();
  console.log("percentage: ", data);
  return c.json({
    data: data,
  });
});

OrderController.get("countorders", async (c: Context) => {
  const data = await OrderService.countOrdersYesterday();
  console.log("count orders: ", data);
  return c.json({
    data: data,
  });
});

OrderController.get("/:id", async (c: Context) => {
  const id = c.req.param("id");
  if (!id) {
    throw new HTTPException(HttpStatus.BAD_REQUEST, {
      message: "param id undefined",
    });
  }
  const data = await OrderService.getOrderById(id);
  return c.json({
    data: data,
    status_code: HttpStatus.OK,
  });
});

OrderController.put("/:id", async (c: Context) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  if (!id) {
    throw new HTTPException(HttpStatus.BAD_REQUEST, {
      message: "param id undefined",
    });
  }
  const user: JWT_RESPONSE = c.get("user");
  const data = await OrderService.updateStatusOrder(id, body.status, user.id);
  return c.json({
    data: data,
    status_code: HttpStatus.OK,
  });
});

export default OrderController;
