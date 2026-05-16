import { prisma } from "@/db";

const OrderService = {
  async getAllOrders() {
    const data = await prisma.orders.findMany();
    return data;
  },
};

export default OrderService;
