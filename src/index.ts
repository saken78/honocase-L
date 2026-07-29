import app from "./app";
import { startExpressDeadlineCron } from "./cron/express-deadline";

startExpressDeadlineCron();

export default {
  port: 9999,
  fetch: app.fetch,
};
