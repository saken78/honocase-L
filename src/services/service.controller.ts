import { Hono, type Context } from "hono";
import { ServiceService } from "./service.service";
import { HttpStatus } from "../lib/status_code";
import { AuthMiddleware } from "../middleware/auth.middleware";
import { HTTPException } from "hono/http-exception";

const ServiceController = new Hono();
ServiceController.use(AuthMiddleware);

ServiceController.get("/", async (c: Context) => {
  const data = await ServiceService.getAllService();
  return c.json(
    {
      data: data,
    },
    HttpStatus.OK,
  );
});
ServiceController.put(":id/", async (c: Context) => {
  const id = c.req.param("id");
  if (!id) {
    throw new HTTPException(HttpStatus.BAD_REQUEST, {
      message: "param undefined",
    });
  }
  const value = Number(c.req.query("value"));
  if (!value) {
    throw new HTTPException(HttpStatus.BAD_REQUEST, {
      message: "param undefined",
    });
  }
  const data = await ServiceService.updateService(id, value);
  return c.json(
    {
      data: data,
    },
    HttpStatus.OK,
  );
});

export default ServiceController;
