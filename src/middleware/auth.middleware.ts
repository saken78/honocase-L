import { type Context, type MiddlewareHandler, type Next } from "hono";
import { verify } from "hono/jwt";
import { SECRET } from "../lib/secret";
import { getSignedCookie } from "hono/cookie";
import { HTTPException } from "hono/http-exception";
import { HttpStatus } from "../lib/status_code";
import type { JWT_PAYLOAD } from "../auth/auth.model";
// import { winstonlogger } from "../lib/winston-logger";

export const AuthMiddleware: MiddlewareHandler = async (
  c: Context,
  next: Next,
): Promise<void> => {
  // winstonlogger.debug("MIDDLEWARE EXECUTE: ");
  if (!SECRET || SECRET === undefined) {
    throw new HTTPException(HttpStatus.UNAUTHORIZED, {
      message: "SECRET NOT FOUND",
    });
  }
  const token = await getSignedCookie(c, SECRET, "access_token");
  if (!token) {
    throw new HTTPException(HttpStatus.UNAUTHORIZED, {
      message: "UNAUTHORIZED",
    });
  }
  console.log(token);
  let user: JWT_PAYLOAD;
  try {
    user = await verify(token, SECRET, "HS256");
  } catch (err) {
    throw new HTTPException(HttpStatus.UNAUTHORIZED, {
      message: "Invalid or expired token",
    });
  }
  c.set("user", {
    id: user.sub,
    email: user.email,
    role: user.role,
  });
  await next();
};
