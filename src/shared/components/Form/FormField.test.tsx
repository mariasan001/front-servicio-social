import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { FormField } from "./FormField";

describe("FormField", () => {
  it("asocia label, hint y error al control", () => {
    render(
      <FormField id="nombre" label="Nombre" hint="Como en tu credencial" error="Requerido" required>
        <input id="nombre" />
      </FormField>,
    );

    expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument();
    expect(screen.getByText("Como en tu credencial")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("Requerido");
    expect(screen.getByLabelText(/nombre/i)).toHaveAttribute(
      "aria-describedby",
      expect.stringContaining("nombre-hint"),
    );
  });
});
