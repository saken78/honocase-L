import { type Context, type MiddlewareHandler, type Next } from "hono";
import { HTTPException } from "hono/http-exception";
import { HttpStatus } from "../lib/status_code";
import type { JWT_RESPONSE } from "../auth/auth.model";

export const OwnerMiddleware: MiddlewareHandler = async (
  c: Context,
  next: Next,
): Promise<void> => {
  const user: JWT_RESPONSE = c.get("user");
  if (user.role !== "owner") {
    throw new HTTPException(HttpStatus.FORBIDDEN, {
      message: "Only owner can access this feature",
    });
  }
  await next();
};
