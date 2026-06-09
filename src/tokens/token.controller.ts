import { Hono, type Context } from "hono";
import { TokenService } from "./token.service";

const TokenController = new Hono();
TokenController.get("/", async (c: Context) => {
  await TokenService.refreshToken(c);

  return c.json({
    message: "Token generated successfuly",
  });
});

export default TokenController;
