import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { SectionEmptyState } from "./SectionEmptyState";

describe("SectionEmptyState", () => {
  it("muestra empty state embebido", () => {
    render(
      <SectionEmptyState
        title="Sin postulaciones"
        description="Cuando postules aparecerán aquí."
      />,
    );

    expect(screen.getByText("Sin postulaciones")).toBeInTheDocument();
    expect(screen.getByText(/cuando postules/i)).toBeInTheDocument();
  });
});
