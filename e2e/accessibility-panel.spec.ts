import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import {
  expectPanelShell,
  getRoleCredentials,
  loginAs,
  type E2ERole,
} from "./helpers/auth";

const CRITICAL_IMPACTS = new Set(["critical", "serious"]);

async function expectNoBlockingA11y(page: Page) {
  const results = await new AxeBuilder({ page }).analyze();
  const blocking = results.violations.filter((violation) =>
    CRITICAL_IMPACTS.has(violation.impact ?? ""),
  );
  expect(blocking).toEqual([]);
}

test.describe("Accesibilidad pública ampliada", () => {
  test("detalle de vacantes (si existe) sin violaciones críticas", async ({ page }) => {
    await page.goto("/vacantes");
    const firstLink = page.locator('a[href^="/vacantes/"]').first();
    const count = await firstLink.count();
    test.skip(count === 0, "No hay vacantes públicas para auditar detalle");

    await firstLink.click();
    await expect(page).toHaveURL(/\/vacantes\/\d+/);
    await expectNoBlockingA11y(page);
  });
});

const PANEL_A11Y_ROLES: E2ERole[] = [
  "admin",
  "alumno",
  "delegacion",
  "titular",
  "enlace",
];

for (const role of PANEL_A11Y_ROLES) {
  const credentials = getRoleCredentials(role);

  test.describe(`Accesibilidad panel — ${role}`, () => {
    test.skip(
      !credentials,
      `Define E2E_${role.toUpperCase()}_USER y PASSWORD para axe del panel`,
    );

    test(`shell de ${role} sin violaciones críticas`, async ({ page }) => {
      if (!credentials) {
        return;
      }

      await loginAs(page, credentials);
      await expectPanelShell(page, credentials);
      await expectNoBlockingA11y(page);
    });
  });
}
