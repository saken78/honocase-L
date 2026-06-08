import { afterEach, beforeEach, describe, expect, it, test } from "bun:test";
import { AuthTest } from "./test-util";
import app from "../src/app";

describe("POST /api/auth", () => {
  // beforeEach(async () => {
  //   await AuthTest.create();
  // });

  // afterEach(async () => {
  //   await AuthTest.delete();
  // });

  it("should be able to login", async () => {
    const response = await app.request("/api/auth/login", {
      method: "post",
      body: JSON.stringify({
        email: "owner@gmail.com",
        password: "ownerhash",
      }),
    });

    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body).toBeDefined();
  });

  // it("should be rejected if username is wrong", async () => {
  //   const response = await root.request("/api/users/login", {
  //     method: "post",
  //     body: JSON.stringify({
  //       email: "salah@gmail.com",
  //       password: "test",
  //     }),
  //   });
  //
  //   expect(response.status).toBe(401);
  //
  //   const body = await response.json();
  //   expect(body.errors).toBeDefined();
  // });
  //
  // it("should be rejected if password is wrong", async () => {
  //   const response = await root.request("/api/users/login", {
  //     method: "post",
  //     body: JSON.stringify({
  //       email: "test@gmail.com",
  //       password: "salah",
  //     }),
  //   });
  //
  //   expect(response.status).toBe(401);
  //
  //   const body = await response.json();
  //   expect(body.errors).toBeDefined();
  // });
});
