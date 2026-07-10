import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { SkipLink } from "./SkipLink";

describe("SkipLink", () => {
  it("apunta al contenido principal", () => {
    render(<SkipLink />);
    const link = screen.getByRole("link", {
      name: /saltar al contenido principal/i,
    });
    expect(link).toHaveAttribute("href", "#main");
  });
});
