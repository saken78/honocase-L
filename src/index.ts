import app from "./app";
import { startExpressDeadlineCron } from "./cron/express-deadline";

startExpressDeadlineCron();

export default {
  port: Bun.env.PORT_DEV,
  fetch: app.fetch,
};
