import { createRoute, z } from "@hono/zod-openapi";

// const schema = z.object({
//   id: z.number().openapi({
//     example: "12ua018123",
//   }),
//   name: z.string().openapi({
//     example: "john mayer",
//   }),
//   phone: z.string().openapi({
//     example: "08218383",
//   }),
//   address: z.string().openapi({
//     example: "Magelang",
//   }),
//   createdAt: z.date().openapi({
//     example: "123n:123efg",
//   }),
// });

const SelectCustomer = z.object({
  id: z.number().openapi({
    example: "12ua018123",
  }),
  name: z.string().openapi({
    example: "john mayer",
  }),
  phone: z.string().openapi({
    example: "08218383",
  }),
  address: z.string().openapi({
    example: "Magelang",
  }),
  createdAt: z.date().openapi({
    example: "123n:123efg",
  }),
});

export const ListOfCustomers = createRoute({
  method: "get",
  path: "/",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: SelectCustomer,
        },
      },
      description: "List of Customers",
    },
  },
});
