import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { HttpStatus } from "./status_code";
import { parsePagination } from "./types";

export function jsonOk<T>(c: Context, data: T) {
  return c.json(
    {
      data,
    },
    HttpStatus.OK,
  );
}

export const jsonOK = jsonOk;

export function jsonCreated<T>(c: Context, data: T) {
  return c.json(
    {
      data,
    },
    HttpStatus.CREATED,
  );
}

export function jsonPaginated<T>(
  c: Context,
  data: { data: T; page?: number; take?: number; total?: number },
) {
  return c.json(
    {
      ...data,
    },
    HttpStatus.OK,
  );
}

export function getPagination(c: Context) {
  const take = Number(c.req.query("take"));
  const page = Number(c.req.query("page"));
  return parsePagination(page, take);
}

export function requireParam(c: Context, name: string): string {
  const value = c.req.param(name);
  if (!value) {
    throw new HTTPException(HttpStatus.BAD_REQUEST, {
      message: `Param ${name} is required`,
    });
  }
  return value;
}

export function requireQuery(c: Context, name: string): string {
  const value = c.req.query(name);
  if (!value) {
    throw new HTTPException(HttpStatus.BAD_REQUEST, {
      message: `Query param ${name} is required`,
    });
  }
  return value;
}

export function getIdParam(c: Context): string {
  return requireParam(c, "id");
}
