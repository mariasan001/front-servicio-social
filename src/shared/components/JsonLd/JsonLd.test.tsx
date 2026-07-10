import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { JsonLd } from "./JsonLd";

describe("JsonLd", () => {
  it("serializa el payload en application/ld+json", () => {
    const data = { "@type": "WebSite", name: "Servicio Social" };
    const { container } = render(<JsonLd data={data} />);
    const script = container.querySelector('script[type="application/ld+json"]');

    expect(script).toBeTruthy();
    expect(script?.innerHTML).toBe(JSON.stringify(data));
  });
});
