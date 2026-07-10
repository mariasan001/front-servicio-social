import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { PageHeader } from "./PageHeader";

describe("PageHeader", () => {
  it("renderiza título h1, descripción y acciones", () => {
    render(
      <PageHeader
        title="Vacantes"
        description="Consulta oportunidades"
        note="Actualizado hoy"
        actions={<button type="button">Nueva</button>}
      />,
    );

    expect(screen.getByRole("heading", { level: 1, name: "Vacantes" })).toBeInTheDocument();
    expect(screen.getByText("Consulta oportunidades")).toBeInTheDocument();
    expect(screen.getByText("Actualizado hoy")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Nueva" })).toBeInTheDocument();
  });

  it("soporta headingLevel 2", () => {
    render(<PageHeader title="Detalle" headingLevel={2} />);
    expect(screen.getByRole("heading", { level: 2, name: "Detalle" })).toBeInTheDocument();
  });
});
