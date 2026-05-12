import { HttpStatus } from "@/lib/status_code";
import type { Context } from "hono";
import { Hono } from "hono";
import { CustomerService } from "./customers.service";
import { HTTPException } from "hono/http-exception";
import { AuthMiddleware } from "@/middleware/auth.middleware";
import type { JWT_RESPONSE } from "@/auth/auth.model";

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
  const data = await CustomerService.getAllCustomer();
  return c.json(data);
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

  const body = await c.req.json();
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

CustomersController.delete("/:id", async (c: Context) => {
  const user: JWT_RESPONSE = await c.get("user");
  if (user.role !== "owner") {
    throw new HTTPException(HttpStatus.FORBIDDEN, {
      message: "Only Owner role can delete customers",
    });
  }

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
