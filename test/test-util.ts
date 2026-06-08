import { prisma } from "../src/db/index";
import bcrypt from "bcryptjs";

export class AuthTest {
  static async create(): Promise<void> {
    await prisma.users.create({
      data: {
        email: "test@gmail.com",
        role: "owner",
        password_hash: await bcrypt.hash("testtesttest", 10),
      },
    });
  }

  static async delete(): Promise<void> {
    await prisma.users.deleteMany({
      where: {
        email: "test@gmail.com",
      },
    });
  }
}
