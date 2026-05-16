import { Hono, type Context } from "hono";
import OrderService from "./order.service";
import { HttpStatus } from "@/lib/status_code";

const OrderController = new Hono();
OrderController.get("/", async (c: Context) => {
  const data = await OrderService.getAllOrders();
  return c.json({
    data: data,
    status_code: HttpStatus.OK,
  });
});

export default OrderController;
