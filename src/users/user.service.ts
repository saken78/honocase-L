import { HttpStatus } from "../lib/status_code";
import { HTTPException } from "hono/http-exception";
import { prisma } from "../db";
import type { UserResponse } from "./user.model";

export const UserService = {
  async getAllUser(): Promise<UserResponse[]> {
    const user = await prisma.users.findMany({
      select: {
        id: true,
        email: true,
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
        role: true,
      },
    });

    if (!user) {
      throw new HTTPException(HttpStatus.NOT_FOUND, {
        message: "User not found",
      });
    }

    return user;
  },
};
