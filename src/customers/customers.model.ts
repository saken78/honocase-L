import { z } from "zod";

export const CREATE_CUSTOMERS_SCHEMA = z.object({
  name: z.string().min(1).max(100),
  phone: z.string().min(8).max(200),
  address: z.string().max(200).optional(),
});

export const UPDATE_CUSTOMER_SCHEMA = z.object({
  name: z.string().min(1).max(200).optional(),
  phone: z.string().min(8).max(200).optional(),
  address: z.string().max(200).optional(),
});

export type CreateCustomerRequest = {
  name: string;
  phone: string;
  address?: string | undefined;
};

export type UpdateCustomerRequest = {
  name?: string;
  phone?: string;
  address?: string;
};

export type CustomersResponse = {
  id: string;
  name: string;
  phone: string;
  address?: string | null;
  total_orders: number | null;
  created_at: Date | null;
  updated_at: Date | null;
};

export type DeleteCustomerResponse = {
  id: string;
};
