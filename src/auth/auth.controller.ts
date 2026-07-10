import { Hono, type Context } from "hono";
import { HttpStatus } from "../lib/status_code";
import { AuthMiddleware } from "../middleware/auth.middleware";
import {
  type JWT_RESPONSE,
  type LoginUserRequest,
  type RegisterUserRequest,
  type ResetPasswordRequest,
} from "./auth.model";
import { AuthService } from "./auth.service";

const AuthController = new Hono();
AuthController.post("/", async (c: Context) => {
  const body: RegisterUserRequest = await c.req.json();
  const result = await AuthService.register(body);
  return c.json(
    {
      data: result,
    },
    HttpStatus.CREATED,
  );
});
AuthController.post("/login", async (c: Context) => {
  const body: LoginUserRequest = await c.req.json();
  const result = await AuthService.login(body, c);
  return c.json(
    {
      data: result,
    },
    HttpStatus.OK,
  );
});
AuthController.use(AuthMiddleware);
AuthController.get("/me", async (c: Context) => {
  const result = await AuthService.me(c);
  return c.json(
    {
      data: result,
    },
    HttpStatus.OK,
  );
});
AuthController.patch("/current", async (c: Context) => {
  const user: JWT_RESPONSE = c.get("user");
  const body: ResetPasswordRequest = await c.req.json();
  await AuthService.resetPassword(body.password, user.email);
  return c.json(
    {
      data: "Password changed successfully",
    },
    HttpStatus.OK,
  );
});
AuthController.delete("/current", async (c: Context) => {
  await AuthService.logout(c);
  return c.json(
    {
      data: "Cookies cleared successfully",
    },
    HttpStatus.OK,
  );
});
AuthController.delete("/delete_account", async (c: Context) => {
  const user: JWT_RESPONSE = c.get("user");
  await AuthService.deleteAccount(user.email);
  return c.json(
    {
      data: "Account Deleted successfully",
    },
    HttpStatus.OK,
  );
});
export default AuthController;
