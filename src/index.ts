import AuthController from "./auth/auth.controller";
import { logger } from "hono/logger";
import { Hono } from "hono";
import GlobalError from "./lib/error-handling";

const root = new Hono();
root.use("/*", logger());
root.basePath("/api").route("/auth", AuthController);

root.onError(GlobalError);

export default {
  port: 9999,
  fetch: root.fetch,
};
