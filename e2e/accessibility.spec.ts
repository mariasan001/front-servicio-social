import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const CRITICAL_IMPACTS = new Set(["critical", "serious"]);

test.describe("Accesibilidad pública", () => {
  test("landing sin violaciones críticas", async ({ page }) => {
    await page.goto("/");
    const results = await new AxeBuilder({ page }).analyze();
    const blocking = results.violations.filter((violation) =>
      CRITICAL_IMPACTS.has(violation.impact ?? ""),
    );
    expect(blocking).toEqual([]);
  });

  test("login sin violaciones críticas", async ({ page }) => {
    await page.goto("/login");
    const results = await new AxeBuilder({ page }).analyze();
    const blocking = results.violations.filter((violation) =>
      CRITICAL_IMPACTS.has(violation.impact ?? ""),
    );
    expect(blocking).toEqual([]);
  });

  test("directorio de vacantes sin violaciones críticas", async ({ page }) => {
    await page.goto("/vacantes");
    const results = await new AxeBuilder({ page }).analyze();
    const blocking = results.violations.filter((violation) =>
      CRITICAL_IMPACTS.has(violation.impact ?? ""),
    );
    expect(blocking).toEqual([]);
  });
});
