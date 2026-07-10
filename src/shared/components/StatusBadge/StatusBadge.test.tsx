import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusBadge } from "./StatusBadge";

describe("StatusBadge", () => {
  it("renderiza etiqueta con role status", () => {
    render(<StatusBadge tone="success">Aprobada</StatusBadge>);
    expect(screen.getByRole("status")).toHaveTextContent("Aprobada");
  });

  it("variante dot expone aria-label", () => {
    render(
      <StatusBadge tone="warning" variant="dot">
        En revisión
      </StatusBadge>,
    );

    expect(screen.getByRole("status", { name: "En revisión" })).toBeInTheDocument();
  });
});
