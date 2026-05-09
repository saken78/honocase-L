import { Hono } from "hono";
import { CustomerService } from "./customers.service";
import { HttpStatus } from "@/lib/status_code";
import type { Context } from "hono";

const CustomersController = new Hono();
CustomersController.post("/", async (c: Context) => {
  const body = await c.req.json();
  const data = await CustomerService.registerCustomer(body);
  return c.json(
    {
      data: data,
      status_code: HttpStatus.CREATED,
    },
    HttpStatus.CREATED,
  );
});

CustomersController.get("/", async () => {});

export default CustomersController;
