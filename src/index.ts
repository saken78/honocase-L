import { OpenAPIHono } from "@hono/zod-openapi";
import Customers from "./routes/customers.index";
import Docs from "./lib/docs";
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
  .route("/docs", Docs)
  .route("/customers", Customers);

export default {
  port: 9999,
  fetch: root.fetch,
};
