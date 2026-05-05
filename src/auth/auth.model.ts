import z from "zod";
import { users_role } from "../../prisma/generated/enums";

export const REGISTER_SCHEMA = z.object({
  email: z.string().email().min(1).max(100),
  password: z.string().min(8).max(100),
  firstname: z.string().min(4).max(100),
  lastname: z.string().min(4).max(100).nullable(),
  role: users_role,
});

export type RegisterUserRequest = {
  email: string;
  password: string;
  firstname: string;
  lastname?: string;
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
  email: string;
  firstname: string;
};

export const AUTH_RESPONSE_SCHEMA = {
  email: z.string().openapi("example@gmail.com"),
  firstname: z.string().openapi("example"),
};

export type JWT_PAYLOAD = {
  sub?: string;
  email?: string;
  role?: string | null | undefined;
  exp?: number;
  iat?: number;
};

export type JWT_RESPONSE = {
  id: string;
  email: string;
  firstname: string;
  role: string;
};
