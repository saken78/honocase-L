import type { JWT_RESPONSE } from "../auth/auth.model";
import { HttpStatus } from "../lib/status_code";
import { AuthMiddleware } from "../middleware/auth.middleware";
import { Hono, type Context } from "hono";
import { HTTPException } from "hono/http-exception";
import OrderService from "./order.service";
import type { orders_status } from "../../prisma/generated/enums";

const OrderController = new Hono();
// OrderController.use(AuthMiddleware);

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
  const data = await OrderService.getAllOrdersJoin();
  return c.json({
    data: data,
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
  const status: string = query_status;
  const day: number = Number(query_day);
  const data = await OrderService.getAllOrdersJoinStatus(status, day);
  return c.json({
    ...data,
    status_code: HttpStatus.OK,
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
  const data = await OrderService.updateStatusOrder(id, body.status);
  return c.json({
    data: data,
    status_code: HttpStatus.OK,
  });
});

export default OrderController;
