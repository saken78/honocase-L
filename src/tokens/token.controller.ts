import { Hono, type Context } from "hono";
import { TokenService } from "./token.service";

const TokenController = new Hono();
TokenController.get("/", async (c: Context) => {
  console.log("exc contr");
  await TokenService.refreshToken(c);

  return c.json({
    message: "Token generated successfuly",
  });
});

export default TokenController;
