import z from "zod";

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
  name?: string;
  phone?: string | undefined;
  address?: string | undefined;
};

export type UpdateCustomerRequest = {
  name?: string;
  phone?: string;
  address?: string;
};

export type CreateCustomerResponse = {
  id: string;
  name: string;
  phone: string;
  address?: string | null;
  created_at: Date | null;
};

export type DeleteCustomerResponse = {
  id: string;
};

export type GetAllCustomers = {
  id: string;
  name: string;
  phone: string;
  address?: string | null;
  created_at: Date | null;
  updated_at: Date | null;
};

export type GetCustomerById = {
  id: string;
  name: string;
  phone: string;
  address?: string | null;
  created_at: Date | null;
  updated_at: Date | null;
};

export type Pagination<T> = {
  data: T;
  take: number;
  total: number;
};
