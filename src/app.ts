import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import AuthController from "./auth/auth.controller";
import CustomersController from "./customers/customers.controller";
import GlobalError from "./lib/error-handling";
import { winstonlogger } from "./lib/winston-logger";
import OrderController from "./orders/order.controller";
import ServiceController from "./services/service.controller";
import UserController from "./users/user.controller";
import TokenController from "./tokens/token.controller";

const app = new Hono();
app.use("/*", logger());
app.use("/*", cors({ origin: "http://localhost:5173", credentials: true }));
app
  .basePath("/api")
  .route("/auth", AuthController)
  .route("/users", UserController)
  .route("/customers", CustomersController)
  .route("/services", ServiceController)
  .route("/orders", OrderController)
  .route("/refresh", TokenController);
app.onError(GlobalError);

for (let i = 0; i < app.routes.length; i++) {
  const route = app.routes[i];
  winstonlogger.info(
    `[METHOD] ${route?.method.padEnd(6)} | [ROUTE] ${route?.path}`,
  );
}

export default app;
