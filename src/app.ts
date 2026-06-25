import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import AuthController from "./auth/auth.controller";
import CustomersController from "./customers/customers.controller";
import GlobalError from "./lib/error-handling";
import { winstonlogger } from "./lib/winston-logger";
import OrderController from "./orders/order.controller";
import PaymentController from "./payments/payment.controller";
import ServiceController from "./services/service.controller";
import UserController from "./users/user.controller";
import TokenController from "./tokens/token.controller";
import DashboardController from "./dashboard/dashboard.controller";

const app = new Hono();
app.use("/*", cors({ origin: "http://localhost:5173", credentials: true }));
app.use("/*", logger());
app
  .basePath("/api")
  .route("/auth", AuthController)
  .route("/users", UserController)
  .route("/customers", CustomersController)
  .route("/services", ServiceController)
  .route("/orders", OrderController)
  .route("/payments", PaymentController)
  .route("/token/refresh", TokenController)
  .route("/dashboard", DashboardController);
app.onError(GlobalError);

for (let i = 0; i < app.routes.length; i++) {
  const route = app.routes[i];
  winstonlogger.info(
    `[METHOD] ${route?.method.padEnd(6)} | [ROUTE] ${route?.path}`,
  );
}

export default app;
