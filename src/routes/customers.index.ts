import { OpenAPIHono } from "@hono/zod-openapi";
import { ListOfCustomers } from "./customers.route";
import { findAllCustomer } from "./customers.handler";

const Customers = new OpenAPIHono();

Customers.openapi(ListOfCustomers, findAllCustomer);

export default Customers;
