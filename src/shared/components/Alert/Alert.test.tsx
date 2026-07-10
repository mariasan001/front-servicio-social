import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Alert } from "./Alert";

describe("Alert", () => {
  it("usa role alert y aria-live assertive en errores", () => {
    render(
      <Alert tone="error" title="Error">
        No se pudo guardar
      </Alert>,
    );

    const alert = screen.getByRole("alert");
    expect(alert).toHaveAttribute("aria-live", "assertive");
    expect(screen.getByText("Error")).toBeInTheDocument();
    expect(screen.getByText("No se pudo guardar")).toBeInTheDocument();
  });

  it("usa role status en tonos informativos", () => {
    render(<Alert tone="success">Guardado</Alert>);
    expect(screen.getByRole("status")).toHaveAttribute("aria-live", "polite");
  });
});
