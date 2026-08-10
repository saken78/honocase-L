import { HTTPException } from "hono/http-exception";
import { ZodError } from "zod";
import { Prisma } from "../../prisma/generated/client";
import { type Context } from "hono";
import { winstonlogger } from "./winston-logger";

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

  if (err instanceof SyntaxError) {
    c.status(400);
    return c.json({
      errors: "Invalid JSON Body",
    });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      c.status(409);
      return c.json({
        errors: "There is a unique constraint violation",
      });
    }

    winstonlogger.error(
      `[Prisma ${err.code}] ${err.message}\n${err.stack ?? ""}`,
    );
    c.status(500);
    return c.json({
      errors: "Internal Server Error",
    });
  }

  if (err instanceof Error) {
    winstonlogger.error(`${err.name}: ${err.message}\n${err.stack ?? ""}`);
  } else {
    winstonlogger.error(`Unknown error: ${JSON.stringify(err)}`);
  }

  // fallback
  c.status(500);

  return c.json({
    errors: "Internal Server Error",
  });
};

export default GlobalError;
