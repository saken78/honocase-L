import { sign } from "hono/jwt";
import type { JWT_PAYLOAD, UserForToken } from "./auth.model";
import { setSignedCookie } from "hono/cookie";
import { SECRET } from "../lib/secret";
import { prisma } from "../db";
import type { Context } from "hono";

export async function renewTokens(
  c: Context,
  user: UserForToken,
): Promise<void> {
  const user_role: string = user.role;
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
    memoryCost: 65536,
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

  await prisma.$executeRaw`UPDATE users set rt_hash = ${token_hash}, expires_at = ${expires_at} where id = ${user.id}`;
}
