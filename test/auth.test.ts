import { afterEach, describe, expect, it } from "bun:test";
import { AuthTest } from "./test-util";
import app from "../src/app";

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
        email: "owner@gmail.com",
        password: "ownerhash",
      }),
    });

    expect(response.status).toBe(200);

    const body = await response.json();
    console.log(body);
    expect(body).toBeDefined();
  });

  it("should be rejected if username is wrong", async (): Promise<void> => {
    const response = await app.request("/api/users/login", {
      method: "post",
      body: JSON.stringify({
        email: "salah@gmail.com",
        password: "test",
      }),
    });

    expect(response.status).toBe(401);

    const body = await response.json();
    expect(body.errors).toBeDefined();
  });

  it("should be rejected if password is wrong", async (): Promise<void> => {
    const response = await app.request("/api/users/login", {
      method: "post",
      body: JSON.stringify({
        email: "test@gmail.com",
        password: "salah",
      }),
    });

    expect(response.status).toBe(401);

    const body = await response.json();
    expect(body.errors).toBeDefined();
  });

  // export const token = {
  //   async refreshToken(c: Context, email: string) {
  //     // const valid = await getSignedCookie(c, SECRET, "refresh_token");
  //
  //     const valid =
  //       await prisma.$queryRaw`SELECT * FROM users where email = ${email} and expires_at < NOW()`;
  //   },
  // };

  // it("should generate new access token", async () => {
  //   const response = await app.request();
  // });
});
