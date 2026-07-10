import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { CupoMeter } from "./CupoMeter";

describe("CupoMeter", () => {
  it("muestra sin cupo cuando no hay datos", () => {
    render(<CupoMeter />);
    expect(screen.getByText("Sin cupo")).toBeInTheDocument();
  });

  it("expone aria-label con libres y total", () => {
    render(<CupoMeter disponible={2} total={5} />);
    expect(
      screen.getByRole("img", { name: "2 lugares libres de 5" }),
    ).toBeInTheDocument();
    expect(screen.getByText("2 libres")).toBeInTheDocument();
  });

  it("marca completo cuando no hay lugares", () => {
    render(<CupoMeter disponible={0} total={3} variant="detail" />);
    expect(screen.getByText("Cupo completo")).toBeInTheDocument();
  });

  it("renderiza slots cuando el total es pequeño", () => {
    render(<CupoMeter disponible={1} total={3} variant="slots" />);
    expect(
      screen.getByRole("img", { name: "1 lugares libres de 3" }),
    ).toBeInTheDocument();
    expect(screen.getByText("1 libre")).toBeInTheDocument();
  });
});
