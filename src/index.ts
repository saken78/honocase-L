import AuthController from "./auth/auth.controller";
import UserController from "./users/user.controller";
import { logger } from "hono/logger";
import { Hono } from "hono";
import GlobalError from "./lib/error-handling";
import { winstonlogger } from "./lib/winston-logger";

const root = new Hono();
root.use("/*", logger());
root
  .basePath("/api")
  .route("/auth", AuthController)
  .route("/user", UserController);

root.onError(GlobalError);
for (let i = 0; i < root.routes.length; i++) {
  const route = root.routes[i];
  winstonlogger.info(
    `[METHOD] ${route?.method.padEnd(6)} | [ROUTE] ${route?.path}`,
  );
}

export default {
  port: 9999,
  fetch: root.fetch,
};
