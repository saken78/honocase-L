import { Context, Hono, type Env, type Input } from "hono";
import { rateLimiter } from "hono-rate-limiter";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import AuthController from "./auth/auth.controller";
import CustomersController from "./customers/customers.controller";
import DashboardController from "./dashboard/dashboard.controller";
import GlobalError from "./lib/error-handling";
import { winstonlogger } from "./lib/winston-logger";
import OrderController from "./orders/order.controller";
import PaymentController from "./payments/payment.controller";
import ServiceController from "./services/service.controller";
import TokenController from "./tokens/token.controller";
import UserController from "./users/user.controller";

const app = new Hono();

const limiter = rateLimiter({
  windowMs: 60 * 1000,
  limit: 5,
  keyGenerator: (c: Context<Env, string, Input>): string =>
    c.req.header("x-forwarded-for") || "unknown",
});

app.use(
  "/*",
  cors({
    origin: Bun.env.CORS_ORIGIN_DEV,
    credentials: true,
  }),
);

app.use("/*", logger());
app.use("/api/auth", limiter);
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
