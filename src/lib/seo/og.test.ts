import { describe, expect, it } from "vitest";
import { OG_IMAGE } from "./og";

describe("OG_IMAGE", () => {
  it("usa dimensiones Open Graph estándar", () => {
    expect(OG_IMAGE).toMatchObject({
      url: "/images/og-default.png",
      width: 1200,
      height: 630,
    });
    expect(OG_IMAGE.alt.length).toBeGreaterThan(10);
  });
});
