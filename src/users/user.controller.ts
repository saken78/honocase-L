import { HttpStatus } from "@/lib/status_code";
import { AuthMiddleware } from "@/middleware/auth.middleware";
import { Hono, type Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { UserService } from "./user.service";

export const UserController = new Hono();

UserController.use(AuthMiddleware);
UserController.get("/", async (c: Context) => {
  const user = await UserService.getAllUser();
  return c.json(
    {
      data: user,
    },
    HttpStatus.OK,
  );
});

UserController.get("/:id", async (c: Context) => {
  const param: string | undefined = c.req.param("id");

  if (!param) {
    throw new HTTPException(403, { message: "param not found" });
  }

  const user = await UserService.getUserId(param);
  return c.json(
    {
      data: user,
    },
    HttpStatus.OK,
  );
});

export default UserController;
