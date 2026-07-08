import z from "zod";
import { users_role } from "../../prisma/generated/enums";

export const REGISTER_SCHEMA = z.object({
  email: z.string().email().min(1).max(100),
  password: z.string().min(8).max(100),
  role: z.string(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
});

export type RegisterUserRequest = {
  email: string;
  password: string;
  first_name?: string | null;
  last_name?: string | null;
  role: users_role;
};

export type LoginUserRequest = {
  email: string;
  password: string;
};

export const LOGIN_SCHEMA = z.object({
  email: z.string().email().min(1).max(100),
  password: z.string().min(8).max(100),
});

export const RESET_PASSWORD_SCHEMA = z.object({
  password: z.string().min(8).max(100),
});

export type ResetPasswordRequest = {
  password: string;
};

export const DELETE_SCHEMA = z.object({
  email: z.string().email().min(1).max(100),
});

export type AuthResponse = {
  id: string;
  email: string;
  role: string;
  first_name?: string | null;
  last_name?: string | null;
};

export type JWT_PAYLOAD = {
  sub?: string;
  email?: string;
  role?: string;
  exp?: number;
  iat?: number;
};

export type JWT_RESPONSE = {
  id: string;
  email: string;
  role: string;
};
