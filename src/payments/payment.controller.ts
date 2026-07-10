import { Hono, type Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { HttpStatus } from "../lib/status_code";
import { AuthMiddleware } from "../middleware/auth.middleware";
import { PaymentService } from "./payment.service";
import { parsePagination } from "../lib/types";

const PaymentController = new Hono();
PaymentController.use(AuthMiddleware);

PaymentController.post("/", async (c: Context) => {
  const body = await c.req.json();
  const data = await PaymentService.recordPayment(body);
  return c.json(
    {
      data: data,
    },
    HttpStatus.CREATED,
  );
});

PaymentController.get("/", async (c: Context) => {
  let take = Number(c.req.query("take"));
  let page = Number(c.req.query("page"));
  const pg = parsePagination(page, take);
  const data = await PaymentService.getAllPayments(pg.take, pg.page);
  return c.json(
    {
      ...data,
    },
    HttpStatus.OK,
  );
});

PaymentController.get("/order/:orderId", async (c: Context) => {
  const orderId = c.req.param("orderId");
  if (!orderId) {
    throw new HTTPException(HttpStatus.BAD_REQUEST, {
      message: "orderId param is required",
    });
  }
  let take = Number(c.req.query("take"));
  let page = Number(c.req.query("page"));
  const pg = parsePagination(page, take);
  const data = await PaymentService.getPaymentsByOrderId(
    orderId,
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

PaymentController.get("/:id", async (c: Context) => {
  const id = c.req.param("id");
  if (!id) {
    throw new HTTPException(HttpStatus.BAD_REQUEST, {
      message: "id param is required",
    });
  }
  const data = await PaymentService.getPaymentById(id);
  return c.json(
    {
      data: data,
    },
    HttpStatus.OK,
  );
});

export default PaymentController;
