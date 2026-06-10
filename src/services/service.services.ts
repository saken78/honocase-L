import { prisma } from "../db";

export const ServiceService = {
  async getAllService() {
    const data = await prisma.service_prices.findMany({
      where: {
        is_active: true,
      },
    });
    return data;
  },
};
