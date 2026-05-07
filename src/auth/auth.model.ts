import z from "zod";
import { users_role } from "../../prisma/generated/enums";

export const REGISTER_SCHEMA = z.object({
  email: z.string().email().min(1).max(100),
  password: z.string().min(8).max(100),
  firstname: z.string().min(4).max(100),
  lastname: z.string().min(4).max(100).optional(),
  role: z.string(),
});

export type RegisterUserRequest = {
  email: string;
  password: string;
  firstname: string;
  lastname?: string;
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
  email: string;
  firstname: string;
  lastname?: string;
  role: string;
};

export const AUTH_RESPONSE_SCHEMA = {
  email: z.string(),
  firstname: z.string(),
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
  firstname: string;
  role: string;
};

export type RegisterUserReponse<T> = {
  data: T;
  status_code: number;
};

export type LoginUserResponse<T> = {
  data: T;
  status_code: number;
};

export type GetMeUser<T> = {
  data: T;
  status_code: number;
};
