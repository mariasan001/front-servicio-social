import { describe, expect, it } from "vitest";
import { resolveColumnWidths } from "./column-widths";
import type { DataTableColumn } from "./DataTable";

type Row = { id: number };

const cell = () => null;

function column(
  overrides: Partial<DataTableColumn<Row>> & Pick<DataTableColumn<Row>, "id" | "variant">,
): DataTableColumn<Row> {
  return {
    header: overrides.id,
    cell,
    ...overrides,
  };
}

describe("resolveColumnWidths", () => {
  it("respeta width explícito", () => {
    expect(
      resolveColumnWidths([column({ id: "a", variant: "text", width: "10rem" })]),
    ).toEqual(["10rem"]);
  });

  it("asigna anchos por variante", () => {
    const widths = resolveColumnWidths([
      column({ id: "nombre", variant: "primary" }),
      column({ id: "area", variant: "text" }),
      column({ id: "estatus", variant: "status" }),
      column({ id: "acciones", variant: "actions" }),
    ]);

    expect(widths[0]).toMatch(/%$/);
    expect(widths[1]).toMatch(/%$/);
    expect(widths[2]).toBe("14rem");
    expect(widths[3]).toBe("5.5rem");
  });

  it("primary sin columnas text usa calc", () => {
    const widths = resolveColumnWidths([
      column({ id: "nombre", variant: "primary" }),
      column({ id: "acciones", variant: "actions" }),
    ]);

    expect(widths[0]).toContain("calc(100%");
  });
});
