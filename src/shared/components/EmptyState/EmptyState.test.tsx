import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { EmptyState } from "./EmptyState";

describe("EmptyState", () => {
  it("muestra título y descripción", () => {
    render(
      <EmptyState title="Sin resultados" description="Prueba otro filtro." />,
    );

    expect(screen.getByText("Sin resultados")).toBeInTheDocument();
    expect(screen.getByText("Prueba otro filtro.")).toBeInTheDocument();
  });
});
