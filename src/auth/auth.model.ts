import { z } from "zod";
import { users_role } from "../../prisma/generated/enums";

export const REGISTER_SCHEMA = z.object({
  email: z.email().min(1).max(100),
  password: z.string().min(8).max(100),
  role: z.enum(users_role),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
});

export const LOGIN_SCHEMA = z.object({
  email: z.email().min(1).max(100),
  password: z.string().min(8).max(100),
});

export const RESET_PASSWORD_SCHEMA = z.object({
  password: z.string().min(8).max(100),
});

export const CHANGE_NAME_SCHEMA = z.object({
  first_name: z.string().optional(),
  last_name: z.string().nullable().optional(),
});

export const DELETE_SCHEMA = z.object({
  email: z.email().min(1).max(100),
});

export type RegisterUserRequest = z.infer<typeof REGISTER_SCHEMA>;
export type LoginUserRequest = z.infer<typeof LOGIN_SCHEMA>;
export type ChangeNameRequest = z.infer<typeof CHANGE_NAME_SCHEMA>;
export type ResetPasswordRequest = z.infer<typeof RESET_PASSWORD_SCHEMA>;

export type AuthResponse = {
  id: string;
  email: string;
  role: string;
  first_name?: string | null;
  last_name?: string | null;
};

export type UserForToken = {
  id: string;
  email: string;
  role: string;
  first_name: string | null;
  last_name: string | null;
};

export type JWT_PAYLOAD = {
  sub?: string;
  email?: string;
  role?: string;
  first_name?: string | null;
  last_name?: string | null;
  exp?: number;
  iat?: number;
};

export type JWT_RESPONSE = {
  id: string;
  email: string;
  role: string;
};
