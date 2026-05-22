import { prisma } from "@/db";
import type {
  GetAllOrdersResponse,
  GetOrderByIdResponse,
  PostOrderRequest,
} from "./order.model";
import { HTTPException } from "hono/http-exception";
import { HttpStatus } from "@/lib/status_code";

const OrderService = {
  async getAllOrders(): Promise<GetAllOrdersResponse[]> {
    const data = await prisma.orders.findMany();
    if (!data) {
      throw new HTTPException(HttpStatus.NOT_FOUND, {
        message: "order not found",
      });
    }
    return data;
  },
  async postOrder(req: PostOrderRequest) {
    const data = await prisma.orders.create({
      data: req,
    });
    return data;
  },
  async getOrderById(id: string): Promise<GetOrderByIdResponse> {
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
};

export default OrderService;
