import { OpenAPIHono } from "@hono/zod-openapi";
import { ListOfCustomers } from "./customers.route";
import { prisma } from "../db/index";

const Customers = new OpenAPIHono();

Customers.openapi(ListOfCustomers, async (c) => {
  const [customers] = await prisma.customers.findMany({
    take: 20,
  });
  return c.json({
    data: customers,
  });
});

export default Customers;
