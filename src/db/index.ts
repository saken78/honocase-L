import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../../prisma/generated/client";
import { winstonlogger } from "../lib/winston-logger";

const adapter = new PrismaMariaDb({
  host: Bun.env.DATABASE_HOST,
  port: Number(Bun.env.DATABASE_PORT),
  user: Bun.env.DATABASE_USER,
  database: Bun.env.DATABASE_NAME,
  password: Bun.env.DATABASE_PASSWORD,
});

const prisma = new PrismaClient({
  adapter: adapter,
  log: [
    {
      emit: "event",
      level: "query",
    },
    {
      emit: "event",
      level: "error",
    },
    {
      emit: "event",
      level: "info",
    },
    {
      emit: "event",
      level: "warn",
    },
  ],
});
prisma.$on("query", (e) => {
  winstonlogger.info(e);
});

prisma.$on("error", (e) => {
  winstonlogger.error(e);
});

prisma.$on("info", (e) => {
  winstonlogger.info(e);
});

prisma.$on("warn", (e) => {
  winstonlogger.warn(e);
});
export { prisma };
