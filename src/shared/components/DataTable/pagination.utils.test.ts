import { describe, expect, it } from "vitest";
import { buildPageRange, getPageSlice } from "@/shared/components/DataTable/pagination.utils";

describe("buildPageRange", () => {
  it("devuelve todas las páginas si totalPages ≤ 7", () => {
    expect(buildPageRange(5, 3)).toEqual([1, 2, 3, 4, 5]);
  });

  it("inserta elipsis en rangos largos", () => {
    const range = buildPageRange(20, 10);
    expect(range[0]).toBe(1);
    expect(range).toContain("ellipsis");
    expect(range[range.length - 1]).toBe(20);
    expect(range).toContain(10);
  });

  it("muestra vecinos al inicio", () => {
    const range = buildPageRange(20, 2);
    expect(range).toContain(1);
    expect(range).toContain(2);
    expect(range).toContain(3);
    expect(range).toContain(4);
  });

  it("muestra vecinos al final", () => {
    const range = buildPageRange(20, 19);
    expect(range).toContain(20);
    expect(range).toContain(19);
    expect(range).toContain(18);
    expect(range).toContain(17);
  });
});

describe("getPageSlice", () => {
  const items = Array.from({ length: 25 }, (_, index) => index + 1);

  it("pagina correctamente", () => {
    expect(getPageSlice(items, 1, 10)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(getPageSlice(items, 3, 10)).toEqual([21, 22, 23, 24, 25]);
  });

  it("última página parcial", () => {
    expect(getPageSlice(items, 3, 10)).toHaveLength(5);
  });
});
