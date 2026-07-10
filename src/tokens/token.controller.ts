import { Hono, type Context } from "hono";
import { TokenService } from "./token.service";
import { HttpStatus } from "../lib/status_code";

const TokenController = new Hono();
TokenController.get("/", async (c: Context) => {
  await TokenService.refreshToken(c);

  return c.json(
    {
      data: "Token generated successfully",
    },
    HttpStatus.OK,
  );
});

export default TokenController;
