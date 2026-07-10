import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Users } from "lucide-react";
import { StatCard, StatCards } from "./StatCard";

describe("StatCard", () => {
  it("muestra label, valor e hint", () => {
    render(
      <StatCard label="Activos" value={12} icon={Users} tone="success" hint="Este mes" />,
    );

    expect(screen.getByText("Activos")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("Este mes")).toBeInTheDocument();
  });
});

describe("StatCards", () => {
  it("agrupa tarjetas con aria-live opcional", () => {
    render(
      <StatCards columns={4} aria-live="polite">
        <StatCard label="A" value={1} icon={Users} />
      </StatCards>,
    );

    expect(screen.getByText("A").closest("[aria-live='polite']")).toBeTruthy();
  });
});
