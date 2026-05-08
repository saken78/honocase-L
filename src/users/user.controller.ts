import type { JSONRespondReturn } from "@/lib/json";
import type { HttpStatus } from "@/lib/status_code";
import { AuthMiddleware } from "@/middleware/auth.middleware";
import { Hono, type Context } from "hono";
import { HTTPException } from "hono/http-exception";
import type { GetAllUser, GetUserById, UserResponse } from "./user.model";
import { UserService } from "./user.service";

export const UserController = new Hono();

UserController.use(AuthMiddleware);
UserController.get(
  "/",
  async (
    c: Context,
  ): Promise<JSONRespondReturn<GetAllUser<UserResponse[]>, HttpStatus.OK>> => {
    const user = await UserService.getAllUser();
    return c.json(
      {
        data: user,
      },
      200,
    );
  },
);

UserController.get(
  "/:id",
  async (
    c: Context,
  ): Promise<JSONRespondReturn<GetUserById<UserResponse>, HttpStatus.OK>> => {
    const param: string | undefined = c.req.param("id");

    if (!param || undefined) {
      throw new HTTPException(403, { message: "param not found" });
    }

    const user = await UserService.getUserId(param);
    return c.json(
      {
        data: user,
      },
      200,
    );
  },
);

export default UserController;
