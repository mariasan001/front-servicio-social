import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PasswordInput } from "./PasswordInput";

describe("PasswordInput", () => {
  it("alterna visibilidad de la contraseña", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <PasswordInput
        label="Contraseña"
        name="password"
        value="secreto"
        onChange={onChange}
      />,
    );

    const input = screen.getByLabelText("Contraseña");
    expect(input).toHaveAttribute("type", "password");

    await user.click(screen.getByRole("button", { name: /mostrar contraseña/i }));
    expect(input).toHaveAttribute("type", "text");
    expect(screen.getByRole("button", { name: /ocultar contraseña/i })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("propaga cambios de valor", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <PasswordInput
        label="Contraseña"
        name="password"
        value=""
        onChange={onChange}
      />,
    );

    await user.type(screen.getByLabelText("Contraseña"), "abc");
    expect(onChange).toHaveBeenCalled();
  });
});
