import { afterEach, describe, expect, it } from "vitest";
import { AuthTest } from "../test-util";
import app from "../../src/app";

describe("POST /api/auth", (): void => {
  afterEach(async (): Promise<void> => {
    await AuthTest.delete();
  });

  it("should not be able to register", async (): Promise<void> => {
    await AuthTest.create();

    const response = await app.request("/api/auth", {
      method: "post",
      body: JSON.stringify({
        email: "test@gmail.com",
        password: "testtestest",
        role: "owner",
      }),
    });

    expect(response.status).toBe(409);

    const body = await response.json();
    expect(body.errors).toBeDefined();
  });

  it("should be able to register", async (): Promise<void> => {
    const response = await app.request("/api/auth", {
      method: "post",
      body: JSON.stringify({
        email: "test@gmail.com",
        password: "testtestest",
        role: "owner",
      }),
    });

    expect(response.status).toBe(201);
  });

  it("should be able to login", async (): Promise<void> => {
    const response = await app.request("/api/auth/login", {
      method: "post",
      body: JSON.stringify({
        email: "karyawan@gmail.com",
        password: "karyawan",
      }),
    });

    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body).toBeDefined();
  });

  it("should be rejected if email is wrong", async (): Promise<void> => {
    const response = await app.request("/api/auth/login", {
      method: "post",
      body: JSON.stringify({
        email: "salah@gmail.com",
        password: "testtesttest",
      }),
    });

    expect(response.status).toBe(401);

    const body = await response.json();
    expect(body.errors).toBeDefined();
  });

  it("should be rejected if password is wrong", async (): Promise<void> => {
    const response = await app.request("/api/auth/login", {
      method: "post",
      body: JSON.stringify({
        email: "test@gmail.com",
        password: "salahtetstststst",
      }),
    });

    expect(response.status).toBe(401);

    const body = await response.json();
    expect(body.errors).toBeDefined();
  });
});
