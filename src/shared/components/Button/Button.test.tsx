import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "./Button";

describe("Button", () => {
  it("renderiza botón y dispara click", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(<Button onClick={onClick}>Guardar</Button>);

    await user.click(screen.getByRole("button", { name: "Guardar" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("renderiza enlace cuando hay href", () => {
    render(<Button href="/vacantes">Ver vacantes</Button>);

    const link = screen.getByRole("link", { name: "Ver vacantes" });
    expect(link).toHaveAttribute("href", "/vacantes");
  });
});
