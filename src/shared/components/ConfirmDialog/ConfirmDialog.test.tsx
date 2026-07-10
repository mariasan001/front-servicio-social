import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConfirmDialog } from "./ConfirmDialog";

describe("ConfirmDialog", () => {
  it("confirma y cancela", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    const onClose = vi.fn();

    render(
      <ConfirmDialog
        open
        title="Eliminar registro"
        description="Esta acción no se puede deshacer."
        confirmLabel="Sí, eliminar"
        onConfirm={onConfirm}
        onClose={onClose}
      />,
    );

    expect(
      screen.getByRole("dialog", { name: "Eliminar registro" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/no se puede deshacer/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Sí, eliminar" }));
    expect(onConfirm).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole("button", { name: /no, volver/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("deshabilita acciones mientras carga", () => {
    render(
      <ConfirmDialog
        open
        title="Procesando"
        description="Espera"
        isLoading
        onConfirm={() => undefined}
        onClose={() => undefined}
      />,
    );

    expect(screen.getByRole("button", { name: /procesando/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /no, volver/i })).toBeDisabled();
  });
});
