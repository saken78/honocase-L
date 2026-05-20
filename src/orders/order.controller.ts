import { Hono, type Context } from "hono";
import OrderService from "./order.service";
import { HttpStatus } from "@/lib/status_code";
import { HTTPException } from "hono/http-exception";

const OrderController = new Hono();
OrderController.get("/", async (c: Context) => {
  const data = await OrderService.getAllOrders();
  return c.json({
    data: data,
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

OrderController.post("/", async (c: Context) => {
  const body = await c.req.json();
  console.log(body);
  const data = await OrderService.postOrder(body);
  return c.json({
    data: data,
    status_code: HttpStatus.CREATED,
  });
});

export default OrderController;
