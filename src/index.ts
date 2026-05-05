import { OpenAPIHono } from "@hono/zod-openapi";
import AuthController from "./auth/auth.controller";
import type { Context } from "hono";

const root = new OpenAPIHono();

root
  .basePath("/api")
  .route(
    "/",
    root.get("", (c: Context) => {
      return c.text("Hello ApiHono!");
    }),
  )
  .route("/auth", AuthController);

export default {
  port: 9999,
  fetch: root.fetch,
};
