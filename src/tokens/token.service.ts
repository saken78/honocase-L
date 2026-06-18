import type { JWT_PAYLOAD } from "@/auth/auth.model";
import type { Context } from "hono";
import { getSignedCookie, setSignedCookie } from "hono/cookie";
import { HTTPException } from "hono/http-exception";
import { sign, verify } from "hono/jwt";
import { prisma } from "../db";
import { SECRET } from "../lib/secret";
import { HttpStatus } from "../lib/status_code";

export const TokenService = {
  async refreshToken(c: Context): Promise<void> {
    console.log("exc1");
    const rt_token = await getSignedCookie(c, SECRET, "refresh_token");
    if (!rt_token) {
      throw new HTTPException(HttpStatus.UNAUTHORIZED, {
        message: "Refresh token undefined",
      });
    }

    const payload: JWT_PAYLOAD = await verify(rt_token, SECRET, "HS256");

    if (!payload.sub) {
      throw new HTTPException(HttpStatus.NOT_FOUND, {
        message: "Email not found from user",
      });
    }
    console.log(payload);

    const user = await prisma.users.findUnique({
      where: {
        id: payload.sub,
      },
      select: {
        id: true,
        email: true,
        role: true,
        expires_at: true,
        rt_hash: true,
      },
    });

    if (!user) {
      throw new HTTPException(HttpStatus.NOT_FOUND, {
        message: "User not found",
      });
    }

    const valid = await Bun.password.verify(rt_token, user.rt_hash!);
    console.log("RT TOKEN DATBASE");
    console.log(rt_token);
    console.log(user.rt_hash!);
    if (!valid) {
      throw new HTTPException(HttpStatus.UNAUTHORIZED, {
        message: "Refresh token not valid",
      });
    }

    const ac_payload: JWT_PAYLOAD = {
      sub: user.id,
      email: user.email,
      role: user.role,
      exp: Math.floor(Date.now() / 1000) + 60 * 15,
      iat: Math.floor(Date.now() / 1000),
    };
    const access_token = await sign(ac_payload, SECRET, "HS256");
    await setSignedCookie(c, "access_token", access_token, SECRET, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 15,
    });
  },
};
