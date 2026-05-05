import { prisma } from "@/db";
import type { Context } from "hono";

export const findAllCustomer = async (c: Context) => {
  const customers = await prisma.customers.findMany({
    take: 20,
  });

  const mapped = customers.map((cust) => ({
    id: cust.id,
    name: cust.name,
    phone: cust.phone,
    address: cust.address ?? null,
    created_at: cust.created_at ?? null,
  }));

  return c.json(
    {
      data: mapped,
      message: "List of customers",
    },
    200,
  );
};
