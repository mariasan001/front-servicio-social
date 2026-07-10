import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchableSelect } from "./SearchableSelect";

const OPTIONS = [
  { value: "tol", label: "Toluca" },
  { value: "mty", label: "Monterrey" },
  { value: "gdl", label: "Guadalajara" },
];

describe("SearchableSelect", () => {
  it("renderiza combobox con ARIA básica", () => {
    render(
      <SearchableSelect
        id="ciudad"
        label="Ciudad"
        options={OPTIONS}
        value=""
        onChange={() => undefined}
      />,
    );

    const combobox = screen.getByRole("combobox", { name: /ciudad/i });
    expect(combobox).toHaveAttribute("aria-expanded", "false");
    expect(combobox).toHaveAttribute("aria-haspopup", "listbox");
  });

  it("filtra y selecciona una opción", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <SearchableSelect
        id="ciudad"
        label="Ciudad"
        options={OPTIONS}
        value=""
        onChange={onChange}
      />,
    );

    const combobox = screen.getByRole("combobox", { name: /ciudad/i });
    await user.click(combobox);
    await user.type(combobox, "mon");

    expect(screen.getByRole("listbox")).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Monterrey" })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: "Toluca" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("option", { name: "Monterrey" }));
    expect(onChange).toHaveBeenCalledWith("mty");
  });

  it("muestra mensaje sin coincidencias", async () => {
    const user = userEvent.setup();

    render(
      <SearchableSelect
        id="ciudad"
        label="Ciudad"
        options={OPTIONS}
        value=""
        onChange={() => undefined}
      />,
    );

    const combobox = screen.getByRole("combobox", { name: /ciudad/i });
    await user.click(combobox);
    await user.type(combobox, "zzz");

    expect(
      screen.getByText("Sin coincidencias. Prueba con otro nombre."),
    ).toBeInTheDocument();
  });

  it("navega con teclado y selecciona con Enter", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <SearchableSelect
        id="ciudad"
        label="Ciudad"
        options={OPTIONS}
        value=""
        onChange={onChange}
      />,
    );

    const combobox = screen.getByRole("combobox", { name: /ciudad/i });
    await user.click(combobox);
    await user.keyboard("{ArrowDown}{Enter}");

    expect(onChange).toHaveBeenCalled();
  });

  it("cierra con Escape sin propagar selección", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <SearchableSelect
        id="ciudad"
        label="Ciudad"
        options={OPTIONS}
        value=""
        onChange={onChange}
      />,
    );

    const combobox = screen.getByRole("combobox", { name: /ciudad/i });
    await user.click(combobox);
    expect(combobox).toHaveAttribute("aria-expanded", "true");
    await user.keyboard("{Escape}");
    expect(combobox).toHaveAttribute("aria-expanded", "false");
    expect(onChange).not.toHaveBeenCalled();
  });
});
