import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ChartEmptyState } from "./ChartEmptyState";

describe("ChartEmptyState", () => {
  it("variante rich con descripción", () => {
    render(
      <ChartEmptyState title="Sin datos" description="Aún no hay registros." />,
    );

    expect(screen.getByText("Sin datos")).toBeInTheDocument();
    expect(screen.getByText("Aún no hay registros.")).toBeInTheDocument();
  });

  it("variante simple sin descripción", () => {
    render(<ChartEmptyState title="Vacío" variant="simple" />);
    expect(screen.getByText("Vacío")).toBeInTheDocument();
  });
});
