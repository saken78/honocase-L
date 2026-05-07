import type { TypedResponse } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import type { InvalidJSONValue, JSONParsed, JSONValue } from "hono/utils/types";

/**
 * @template T - The type of the JSON value or simplified unknown type.
 * @template U - The type of the status code.
 *
 * @returns {Response & TypedResponse<JSONParsed<T>, U, 'json'>} - The response after rendering the JSON object, typed with the provided object and status code types.
 */

export type JSONRespondReturn<
  T extends JSONValue | {} | InvalidJSONValue,
  U extends ContentfulStatusCode,
> = Response & TypedResponse<JSONParsed<T>, U, "json">;
