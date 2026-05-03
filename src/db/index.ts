import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../../prisma/generated/client";

const adapter = new PrismaMariaDb({
  user: Bun.env["DATABASE_USER"] || "",
  database: Bun.env["DATABASE_NAME"] || "",
});

const prisma = new PrismaClient({ adapter: adapter });
export { prisma };
