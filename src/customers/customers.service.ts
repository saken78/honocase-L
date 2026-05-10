import { prisma } from "@/db";
import {
  CREATE_CUSTOMERS_SCHEMA,
  UPDATE_CUSTOMER_SCHEMA,
  type CreateCustomerRequest,
  type CreateCustomerResponse,
  type GetAllCustomers,
  type GetCustomerById,
  type UpdateCustomerRequest,
} from "./customers.model";
import { HTTPException } from "hono/http-exception";
import { HttpStatus } from "@/lib/status_code";

export const CustomerService = {
  async registerCustomer(
    req: CreateCustomerRequest,
  ): Promise<CreateCustomerResponse> {
    const valid = CREATE_CUSTOMERS_SCHEMA.parse(req);
    const data = await prisma.customers.create({
      data: {
        name: valid.name,
        phone: valid.phone,
        address: valid.address ?? null,
      },
    });
    return data;
  },
  async getAllCustomer(): Promise<GetAllCustomers[]> {
    const data = await prisma.customers.findMany({
      take: 10,
      orderBy: { name: "asc" },
    });
    return data;
  },
  async getCustomerById(id: string): Promise<GetCustomerById> {
    const data = await prisma.customers.findUnique({
      where: { id: id },
    });
    if (!data) {
      throw new HTTPException(HttpStatus.NOT_FOUND, {
        message: `customer with ${id} not found`,
      });
    }
    return data;
  },
  async updateCustomerById(id: string, cust_data: UpdateCustomerRequest) {
    const valid_include_undefined = UPDATE_CUSTOMER_SCHEMA.parse(cust_data);
    const valid = Object.fromEntries(
      Object.entries(valid_include_undefined).filter((_, v) => v !== undefined),
    );
    console.log(valid);
    const data = await prisma.customers.update({
      where: { id: id },
      data: valid,
    });
    return data;
  },
};
