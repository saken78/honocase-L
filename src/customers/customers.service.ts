import { prisma } from "@/db";
import {
  CREATE_CUSTOMERS_SCHEMA,
  type CreateCustomerRequest,
  type CreateCustomerResponse,
} from "./customers.model";

export const CustomerService = {
  async registerCustomer(
    req: CreateCustomerRequest,
  ): Promise<CreateCustomerResponse> {
    const valid = CREATE_CUSTOMERS_SCHEMA.parse(req);
    const data = prisma.customers.create({
      data: {
        firstname: valid.firstname,
        lastname: valid.lastname ?? null,
        phone: valid.phone,
        address: valid.address ?? null,
      },
    });
    return data;
  },
};
