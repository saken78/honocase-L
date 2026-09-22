import { AuthMiddleware } from "../middleware/auth.middleware";
import { Hono, type Context } from "hono";
import { UserService } from "./user.service";
import { jsonOk, requireParam } from "../lib/response";

const UserController = new Hono();

UserController.use(AuthMiddleware);
UserController.get("/", async (c: Context) => {
  const user = await UserService.getAllUser();
  return jsonOk(c, user);
});

UserController.get("/:id", async (c: Context) => {
  const param = requireParam(c, "id");

  const user = await UserService.getUserId(param);
  return jsonOk(c, user);
});

export default UserController;
