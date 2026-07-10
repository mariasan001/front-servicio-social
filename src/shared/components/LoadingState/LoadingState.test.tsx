import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { LoadingState } from "./LoadingState";

describe("LoadingState", () => {
  it("anuncia carga con role status", () => {
    render(<LoadingState label="Cargando vacantes" description="Un momento" />);

    const status = screen.getByRole("status");
    expect(status).toHaveAttribute("aria-busy", "true");
    expect(screen.getByText("Cargando vacantes")).toBeInTheDocument();
    expect(screen.getByText("Un momento")).toBeInTheDocument();
  });
});
