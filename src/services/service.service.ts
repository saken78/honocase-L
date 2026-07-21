import { HTTPException } from "hono/http-exception";
import { prisma } from "../db";
import type { ServiceResponse } from "./service.model";
import { HttpStatus } from "../lib/status_code";

export const ServiceService = {
  async getAllService(): Promise<ServiceResponse[]> {
    const data = await prisma.service_prices.findMany({
      where: {
        is_active: true,
      },
    });
    return data;
  },
  async updateService(id: string, value: number): Promise<ServiceResponse> {
    const data = await prisma.service_prices.findUnique({
      where: {
        id: id,
      },
    });
    if (!data) {
      throw new HTTPException(HttpStatus.NOT_FOUND, {
        message: "service not found",
      });
    }
    const update = await prisma.service_prices.update({
      where: {
        id: id,
      },
      data: {
        price_min: value,
      },
    });
    return update;
  },
};
