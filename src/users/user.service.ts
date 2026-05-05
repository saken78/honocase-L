import { HTTPException } from "hono/http-exception";
import { prisma } from "../db/index";
import type { UserResponse } from "./user.model";

export const UserService = {
  async getAllUser(): Promise<UserResponse[]> {
    const user = await prisma.users.findMany({
      select: {
        id: true,
        email: true,
        firstname: true,
        role: true,
      },
    });
    return user;
  },
  async getUserId(id: string): Promise<UserResponse> {
    const user = await prisma.users.findUnique({
      where: { id: id },
      select: {
        id: true,
        email: true,
        firstname: true,
        role: true,
      },
    });

    if (!user || null) {
      throw new HTTPException(404, { message: "User not found" });
    }

    return user;
  },
};
