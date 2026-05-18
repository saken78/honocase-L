import { prisma } from "@/db";

const OrderService = {
  async getAllOrders() {
    const data = await prisma.orders.findMany();
    return data;
  },
  async getOrderById(id: string) {
    const data = await prisma.orders.findUnique({
      where: { id: id },
    });
    return data;
  },
};

export default OrderService;
