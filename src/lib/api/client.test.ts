import { afterEach, describe, expect, it } from "vitest";
import {
  API_PROXY_PATH,
  getApiBaseUrl,
  getBackendOrigin,
  resolveApiUrl,
  resolveBackendUrl,
} from "./client";

const ORIGINAL_ENV = { ...process.env };

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

describe("API URL helpers", () => {
  it("usa defaults locales", () => {
    delete process.env.API_PROXY_TARGET;
    delete process.env.NEXT_PUBLIC_API_URL;

    expect(getBackendOrigin()).toBe("http://localhost:8080");
    expect(getApiBaseUrl()).toBe(API_PROXY_PATH);
    expect(resolveBackendUrl("vacantes")).toBe("http://localhost:8080/vacantes");
    expect(resolveBackendUrl("/health")).toBe("http://localhost:8080/health");
  });

  it("resuelve proxy relativo y absoluto", () => {
    delete process.env.NEXT_PUBLIC_API_URL;
    expect(resolveApiUrl("/users")).toBe("/api/backend/users");
    expect(resolveApiUrl("users", "https://app.example")).toBe(
      "https://app.example/api/backend/users",
    );

    process.env.NEXT_PUBLIC_API_URL = "https://api.example/";
    expect(resolveApiUrl("/users")).toBe("https://api.example/users");
  });

  it("respeta API_PROXY_TARGET", () => {
    process.env.API_PROXY_TARGET = "https://backend.internal/";
    expect(getBackendOrigin()).toBe("https://backend.internal/");
    expect(resolveBackendUrl("/x")).toBe("https://backend.internal/x");
  });
});
