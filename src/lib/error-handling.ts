import { HTTPException } from "hono/http-exception";
import { ZodError } from "zod";
import { Prisma } from "../../prisma/generated/client";
import { type Context } from "hono";
type Success<T> = {
  data: T;
  error: null;
};

type Failure<T> = {
  data: null;
  error: T;
};

export type Result<T, E = Error | HTTPException> = Success<T> | Failure<E>;

const GlobalError = async (err: unknown, c: Context) => {
  if (err instanceof HTTPException) {
    c.status(err.status);
    return c.json({
      errors: err.message,
    });
  }

  if (err instanceof ZodError) {
    c.status(400);
    return c.json({
      errors: err.issues,
    });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      c.status(409);
      return c.json({
        errors:
          "There is a unique constraint violation, a new user cannot be created with this email",
      });
    }

    c.status(500);
    return c.json({
      errors: err.message,
    });
  }

  // fallback
  c.status(500);

  return c.json({
    errors: err instanceof Error ? err.message : "Internal Server Error",
  });
};

export default GlobalError;
