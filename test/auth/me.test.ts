import { afterEach, describe, it, expect } from "vitest";
import app from "../../src/app";

describe("GET /api/auth/me", () => {
  afterEach(async () => {});

  it("should be able to login", async () => {
    const response = await app.request("/api/auth/login", {
      method: "post",
      body: JSON.stringify({
        email: "karyawan@gmail.com",
        password: "karyawan",
      }),
    });

    expect(response.status).toBe(200);
    const cookieHeader = response.headers
      .getSetCookie()
      .map((c) => c.split(";")[0])
      .join("; ");

    const meResponse = await app.request("/api/auth/me", {
      headers: {
        Cookie: cookieHeader,
      },
    });
    expect(meResponse.status).toBe(200);

    const body = await response.json();
    expect(body.data.email).toBe("karyawan@gmail.com");
  });
});
