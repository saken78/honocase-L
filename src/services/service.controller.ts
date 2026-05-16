import { Hono, type Context } from "hono";
import { ServiceService } from "./service.services";
import { HttpStatus } from "@/lib/status_code";

const ServiceController = new Hono();
ServiceController.get("/", async (c: Context) => {
  const data = await ServiceService.getAllService();
  return c.json({
    data: data,
    status_code: HttpStatus.OK,
  });
});

export default ServiceController;
