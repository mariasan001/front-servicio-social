import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Modal } from "./Modal";

describe("Modal", () => {
  it("no renderiza cuando está cerrado", () => {
    const { container } = render(
      <Modal open={false} title="Detalle" onClose={() => undefined}>
        Contenido
      </Modal>,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("expone diálogo accesible y cierra con Escape", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(
      <Modal open title="Detalle de vacante" onClose={onClose}>
        <p>Cuerpo</p>
      </Modal>,
    );

    expect(screen.getByRole("dialog", { name: "Detalle de vacante" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cerrar" })).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("no cierra con Escape si hay un combobox abierto", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(
      <Modal open title="Formulario" onClose={onClose}>
        <input
          role="combobox"
          aria-expanded="true"
          aria-controls="opciones"
          aria-label="Buscar"
        />
      </Modal>,
    );

    await user.keyboard("{Escape}");
    expect(onClose).not.toHaveBeenCalled();
  });

  it("cierra al hacer clic en el overlay", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    const { container } = render(
      <Modal open title="Overlay" onClose={onClose}>
        Cuerpo
      </Modal>,
    );

    const overlay = container.querySelector("[class*='overlay']");
    expect(overlay).toBeTruthy();
    await user.click(overlay!);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
