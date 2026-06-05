import { Hono, type Context } from "hono";
import { HttpStatus } from "../lib/status_code";
import { AuthMiddleware } from "../middleware/auth.middleware";
import {
  type JWT_RESPONSE,
  type LoginUserRequest,
  type RegisterUserRequest,
  type ResetPasswordRequest,
} from "./auth.model";
import { authService } from "./auth.service";

const AuthController = new Hono();
AuthController.post("/", async (c: Context) => {
  const body: RegisterUserRequest = await c.req.json();
  const result = await authService.register(body);
  c.status(HttpStatus.CREATED);
  return c.json(
    {
      data: result,
      status_code: HttpStatus.CREATED,
    },
    HttpStatus.CREATED,
  );
});
AuthController.post("/login", async (c: Context) => {
  const body: LoginUserRequest = await c.req.json();
  const result = await authService.login(body, c);
  return c.json(
    {
      data: result,
      status_code: HttpStatus.OK,
    },
    HttpStatus.OK,
  );
});
AuthController.use(AuthMiddleware);
AuthController.get("/me", async (c: Context) => {
  const result = await authService.me(c);
  return c.json(
    {
      data: result,
      status_code: HttpStatus.OK,
    },
    HttpStatus.OK,
  );
});
AuthController.patch("/current", async (c: Context) => {
  const user: JWT_RESPONSE = c.get("user");
  const body: ResetPasswordRequest = await c.req.json();
  await authService.resetPassword(body.password, user.email);
  return c.json({
    data: "Password changed successfully",
    status_code: HttpStatus.OK,
  });
});
AuthController.delete("/current", async (c: Context) => {
  await authService.logout(c);
  return c.json({
    message: "Cookies cleared successfully",
    status_code: HttpStatus.OK,
  });
});
AuthController.delete("/delete_account", async (c: Context) => {
  const user: JWT_RESPONSE = c.get("user");
  await authService.deleteAccount(user.email);
  return c.json({
    message: "Account deleted successfully",
    status_code: HttpStatus.OK,
  });
});
export default AuthController;
