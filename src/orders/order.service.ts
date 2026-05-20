import { prisma } from "@/db";
import type { PostOrder } from "./order.model";
import { HTTPException } from "hono/http-exception";
import { HttpStatus } from "@/lib/status_code";

const OrderService = {
  async getAllOrders() {
    const data = await prisma.orders.findMany();
    if (!data) {
      throw new HTTPException(HttpStatus.NOT_FOUND, {
        message: "order not found",
      });
    }
    return data;
  },
  async getOrderById(id: string) {
    const data = await prisma.orders.findUnique({
      where: { id: id },
    });
    if (!data) {
      throw new HTTPException(HttpStatus.NOT_FOUND, {
        message: "order not found",
      });
    }
    return data;
  },
  async postOrder(req: PostOrder) {
    const data = await prisma.orders.create({
      data: req,
    });
    return data;
  },
};

export default OrderService;
