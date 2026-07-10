import type { Context } from "hono";
import { deleteCookie, getSignedCookie, setSignedCookie } from "hono/cookie";
import { HTTPException } from "hono/http-exception";
import { sign } from "hono/jwt";
import { users_role } from "../../prisma/generated/enums";
import { prisma } from "../db";
import { SECRET } from "../lib/secret";
import { HttpStatus } from "../lib/status_code";
import {
  type AuthResponse,
  DELETE_SCHEMA,
  type JWT_PAYLOAD,
  type JWT_RESPONSE,
  LOGIN_SCHEMA,
  type LoginUserRequest,
  REGISTER_SCHEMA,
  type RegisterUserRequest,
  RESET_PASSWORD_SCHEMA,
} from "./auth.model";

export const AuthService = {
  async register(req: RegisterUserRequest): Promise<AuthResponse> {
    const request = REGISTER_SCHEMA.parse(req);

    const password = await Bun.password.hash(request.password, {
      algorithm: "argon2id",
      memoryCost: 4,
      timeCost: 3,
    });

    if (
      request.role !== users_role.karyawan &&
      request.role !== users_role.owner
    ) {
      throw new HTTPException(HttpStatus.BAD_REQUEST, {
        message: "Role not found",
      });
    }

    const user = await prisma.users.create({
      data: {
        email: request.email,
        password_hash: password,
        role: request.role,
        first_name: request.first_name || null,
        last_name: request.last_name || null,
      },
    });

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      first_name: user.first_name,
      last_name: user.last_name,
    };
  },
  async login(req: LoginUserRequest, c: Context): Promise<AuthResponse> {
    const request = LOGIN_SCHEMA.parse(req);

    if (!SECRET) {
      throw new HTTPException(HttpStatus.BAD_REQUEST, {
        message: "Secret not found",
      });
    }

    const user = await prisma.users.findUnique({
      where: { email: request.email },
      select: {
        id: true,
        email: true,
        password_hash: true,
        role: true,
        first_name: true,
        last_name: true,
      },
    });

    if (!user) {
      throw new HTTPException(HttpStatus.UNAUTHORIZED, {
        message: "User tidak ditemukan",
      });
    }

    const match = await Bun.password.verify(
      request.password,
      user.password_hash,
    );

    if (!match) {
      throw new HTTPException(HttpStatus.UNAUTHORIZED, {
        message: "Password atau email salah",
      });
    }
    const user_role: string = user.role;

    // ==================== access_token ======================== //
    const ac_payload: JWT_PAYLOAD = {
      sub: user.id,
      email: user.email,
      role: user_role,
      first_name: user.first_name,
      last_name: user.last_name,
      exp: Math.floor(Date.now() / 1000) + 60 * 15,
      iat: Math.floor(Date.now() / 1000),
    };

    const access_token = await sign(ac_payload, SECRET, "HS256");
    await setSignedCookie(c, "access_token", access_token, SECRET, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 15,
    });
    // ==================== access_token ======================== //

    // ==================== refresh_token ======================== //
    const rt_payload: JWT_PAYLOAD = {
      sub: user.id,
      email: user.email,
      role: user_role,
      first_name: user.first_name,
      last_name: user.last_name,
      exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
      iat: Math.floor(Date.now() / 1000),
    };
    const refresh_token = await sign(rt_payload, SECRET, "HS256");
    const token_hash = await Bun.password.hash(refresh_token, {
      algorithm: "argon2id",
      memoryCost: 4,
      timeCost: 3,
    });

    const expires_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await setSignedCookie(c, "refresh_token", refresh_token, SECRET, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    // ==================== refresh_token ======================== //

    await prisma.$executeRaw`UPDATE users set rt_hash = ${token_hash}, expires_at = ${expires_at} where id = ${user.id}`;

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      first_name: user.first_name || null,
      last_name: user.last_name || null,
    };
  },
  async me(c: Context): Promise<JWT_RESPONSE> {
    const result = c.get("user");
    return result;
  },
  async logout(c: Context): Promise<void> {
    const refresh_token = await getSignedCookie(c, SECRET, "refresh_token");
    if (!refresh_token) {
      throw new HTTPException(HttpStatus.UNAUTHORIZED, {
        message: "Cookie Already Cleared",
      });
    }

    deleteCookie(c, "refresh_token");
    deleteCookie(c, "access_token");
  },
  async resetPassword(password: string, email: string): Promise<void> {
    const npw = await Bun.password.hash(password, {
      algorithm: "argon2id",
      memoryCost: 4,
      timeCost: 3,
    });

    await prisma.users.update({
      where: { email: email },
      data: { password_hash: npw },
    });
  },
  async deleteAccount(email: string): Promise<void> {
    const validated_email = DELETE_SCHEMA.parse({ email });
    if (!validated_email.email) {
      throw new HTTPException(HttpStatus.UNAUTHORIZED, {
        message: "Unauthorized",
      });
    }
    await prisma.users.delete({
      where: { email: validated_email.email },
    });
  },
};
