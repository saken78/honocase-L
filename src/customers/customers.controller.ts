import { HttpStatus } from "../lib/status_code";
import type { Context } from "hono";
import { Hono } from "hono";
import { CustomerService } from "./customers.service";
import { HTTPException } from "hono/http-exception";
import { AuthMiddleware } from "../middleware/auth.middleware";
import type { UpdateCustomerRequest } from "./customers.model";
import { OwnerMiddleware } from "../middleware/owner.middleware";

const CustomersController = new Hono();
CustomersController.use(AuthMiddleware);
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

CustomersController.get("/", async (c: Context) => {
  let take: number = Number(c.req.query("take"));
  let page: number = Number(c.req.query("page"));

  page = isNaN(page) ? 1 : page;
  take = isNaN(take) ? 10 : take;

  const data = await CustomerService.getAllCustomer(take, page);
  return c.json({
    ...data,
    status_code: HttpStatus.OK,
  });
});

CustomersController.get("/:id", async (c: Context) => {
  const id = c.req.param("id");
  if (!id || id === "") {
    throw new HTTPException(HttpStatus.BAD_REQUEST, {
      message: "param undefined",
    });
  }
  const data = await CustomerService.getCustomerById(id);
  return c.json({
    data: data,
    status_code: HttpStatus.OK,
  });
});

CustomersController.put("/:id", async (c: Context) => {
  const id = c.req.param("id");
  if (!id || id === "") {
    throw new HTTPException(HttpStatus.BAD_REQUEST, {
      message: "param undefined",
    });
  }

  const body: UpdateCustomerRequest = await c.req.json();

  if (!body) {
    throw new HTTPException(HttpStatus.BAD_REQUEST, {
      message: "Body undefined",
    });
  }

  const data = await CustomerService.updateCustomerById(id, body);
  return c.json({
    data: data,
    status_code: HttpStatus.OK,
  });
});
CustomersController.use(OwnerMiddleware);
CustomersController.delete("/:id", async (c: Context) => {
  const id = c.req.param("id");
  if (!id) {
    throw new HTTPException(HttpStatus.BAD_REQUEST, {
      message: "Param undefined",
    });
  }
  const data = await CustomerService.deleteCustomerById(id);

  return c.json({
    data: data,
    status_code: HttpStatus.OK,
    message: "Delete user success",
  });
});

export default CustomersController;
