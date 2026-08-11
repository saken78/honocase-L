import { prisma } from "../src/db/index";

export class AuthTest {
  static async create(): Promise<void> {
    await prisma.users.create({
      data: {
        email: "test@gmail.com",
        role: "owner",
        password_hash: await Bun.password.hash("testtesttest", {
          algorithm: "argon2id",
          memoryCost: 65536,
          timeCost: 3,
        }),
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
