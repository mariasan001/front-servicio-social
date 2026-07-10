import { describe, expect, it } from "vitest";
import {
  buildDonutArcs,
  DONUT_CIRCUMFERENCE,
  percent,
} from "./dashboard-chart.utils";

describe("percent", () => {
  it("redondea porcentaje y evita división por cero", () => {
    expect(percent(25, 100)).toBe(25);
    expect(percent(1, 3)).toBe(33);
    expect(percent(10, 0)).toBe(0);
  });
});

describe("buildDonutArcs", () => {
  it("arma arcos proporcionales y filtra segmentos minúsculos", () => {
    const arcs = buildDonutArcs([
      { value: 70, color: "#6b2340" },
      { value: 30, color: "#b8956a" },
      { value: 0, color: "#ccc" },
    ]);

    expect(arcs).toHaveLength(2);
    expect(arcs[0]?.color).toBe("#6b2340");
    expect(arcs[0]?.length).toBeCloseTo(0.7 * DONUT_CIRCUMFERENCE, 5);
    expect(arcs[0]?.rotation).toBe(-90);
    expect(arcs[1]?.rotation).toBeGreaterThan(arcs[0]!.rotation);
  });

  it("devuelve vacío si no hay valores", () => {
    expect(buildDonutArcs([])).toEqual([]);
    expect(buildDonutArcs([{ value: 0, color: "#000" }])).toEqual([]);
  });
});
