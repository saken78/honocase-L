import { Hono, type Context } from "hono";
import { UserService } from "./user.service";
import { HTTPException } from "hono/http-exception";

export const UserController = new Hono();

UserController.get("/", async (c: Context) => {
  const user = await UserService.getAllUser();
  return c.json(
    {
      data: user,
      status_code: 200,
    },
    200,
  );
});

UserController.get("/:id", async (c: Context) => {
  const param: string | undefined = c.req.param("id");
  if (!param || undefined) {
    throw new HTTPException(403, { message: "param not found" });
  }
  const user = await UserService.getUserId(param);
  return c.json({
    data: user,
  });
});

export default UserController;
