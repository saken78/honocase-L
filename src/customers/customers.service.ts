import { prisma } from "../db";
import {
  CREATE_CUSTOMERS_SCHEMA,
  UPDATE_CUSTOMER_SCHEMA,
  type CreateCustomerRequest,
  type CustomersResponse,
  type DeleteCustomerResponse,
  type UpdateCustomerRequest,
} from "./customers.model";
import { HTTPException } from "hono/http-exception";
import { HttpStatus } from "../lib/status_code";
import type { Pagination } from "../lib/types";

export const CustomerService = {
  async registerCustomer(
    req: CreateCustomerRequest,
  ): Promise<CustomersResponse> {
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
  async getAllCustomer(
    many: number,
    page: number,
  ): Promise<Pagination<CustomersResponse[]>> {
    const ofs: number = (page - 1) * many;

    const data = await prisma.customers.findMany({
      orderBy: { name: "asc" },
      take: many,
      skip: ofs,
    });
    return {
      data: data,
      page: page,
      take: many,
      total: await prisma.customers.count(),
    };
  },
  async getCustomerById(id: string): Promise<Pagination<CustomersResponse>> {
    const data = await prisma.customers.findUnique({
      where: { id: id },
    });
    if (!data) {
      throw new HTTPException(HttpStatus.NOT_FOUND, {
        message: `customer with ${id} not found`,
      });
    }
    return {
      data: data,
      take: 1,
      total: 1,
    };
  },
  async updateCustomerById(
    id: string,
    cust_data: UpdateCustomerRequest,
  ): Promise<CustomersResponse> {
    const check = await prisma.customers.findUnique({
      where: { id: id },
    });
    if (!check) {
      throw new HTTPException(HttpStatus.NOT_FOUND, {
        message: `Customer with ${id} not found`,
      });
    }
    let parsed = UPDATE_CUSTOMER_SCHEMA.parse(cust_data);
    const valid = Object.fromEntries(
      Object.entries(parsed).filter(([, valid]) => valid !== undefined),
    );
    const data = await prisma.customers.update({
      where: { id: id },
      data: {
        ...valid,
      },
    });
    return data;
  },
  async deleteCustomerById(id: string): Promise<DeleteCustomerResponse> {
    const valid = await prisma.customers.findUnique({ where: { id: id } });
    if (!valid) {
      throw new HTTPException(HttpStatus.NOT_FOUND, {
        message: "Account not found",
      });
    }
    const data = await prisma.customers.delete({
      where: { id: id },
      select: { id: true },
    });
    return data;
  },
};
