import { OpenAPIHono } from "@hono/zod-openapi";
import { ListOfCustomers } from "./customers.route";

const Customers = new OpenAPIHono();

Customers.openapi(ListOfCustomers, (c) => {
  return c.json({
    message: "List of Customers",
  });
});

export default Customers;
