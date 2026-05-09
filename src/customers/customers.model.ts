import z from "zod";

export const CREATE_CUSTOMERS_SCHEMA = z.object({
  firstname: z.string().min(1).max(100),
  lastname: z.string().min(1).max(100).optional(),
  phone: z.string().min(8).max(200),
  address: z.string().max(200).optional(),
});

export type CreateCustomerRequest = {
  firstname: string;
  lastname?: string;
  phone: string;
  address?: string;
};

export type CreateCustomerResponse = {
  id: string;
  firstname: string;
  lastname?: string | null;
  phone: string;
  address?: string | null;
  total_orders: number | null;
  created_at: Date | null;
  updated_at: Date | null;
};
