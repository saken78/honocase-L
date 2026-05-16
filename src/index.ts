import AuthController from "./auth/auth.controller";
import UserController from "./users/user.controller";
import CustomersController from "./customers/customers.controller";
import { logger } from "hono/logger";
import { Hono } from "hono";
import GlobalError from "./lib/error-handling";
import { winstonlogger } from "./lib/winston-logger";
import { cors } from "hono/cors";
import ServiceController from "./services/service.controller";
import OrderController from "./orders/order.controller";

const root = new Hono();
root.use("/*", logger());
root.use("/*", cors({ origin: "http://localhost:5173", credentials: true }));
root.onError(GlobalError);
root
  .basePath("/api")
  .route("/auth", AuthController)
  .route("/users", UserController)
  .route("/customers", CustomersController)
  .route("/services", ServiceController)
  .route("/orders", OrderController);

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
