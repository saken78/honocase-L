import { prisma } from "../db";
import type { ServiceResponseAll } from "./service.model";

export const ServiceService = {
  async getAllService(): Promise<ServiceResponseAll[]> {
    const data = await prisma.service_prices.findMany({
      where: {
        is_active: true,
      },
    });
    return data;
  },
};
