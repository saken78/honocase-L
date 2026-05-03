import { OpenAPIHono } from "@hono/zod-openapi";
import { Scalar } from "@scalar/hono-api-reference";

const Docs = new OpenAPIHono();

Docs.doc("/", {
  openapi: "3.0.0",
  info: {
    title: "doc",
    version: "1.0.0",
  },
});

Docs.get(
  "/scalar",
  Scalar({
    url: "/docs",
  }),
);

export default Docs;
