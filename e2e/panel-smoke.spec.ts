import { test, expect } from "@playwright/test";
import {
  expectPanelShell,
  getRoleCredentials,
  loginAs,
  type E2ERole,
} from "./helpers/auth";

const ROLES: E2ERole[] = ["admin", "alumno", "delegacion", "titular", "enlace"];

const SECTION_SMOKE: Partial<Record<E2ERole, string[]>> = {
  admin: ["/panel/admin/dependencias", "/panel/admin/usuarios"],
  alumno: ["/panel/alumno/vacantes", "/panel/alumno/cv"],
  delegacion: ["/panel/delegacion/vacantes", "/panel/delegacion/validacion/documentos"],
  titular: ["/panel/titular/vacantes", "/panel/titular/postulaciones"],
  enlace: ["/panel/enlace/alumnos", "/panel/enlace/procesos"],
};

for (const role of ROLES) {
  const credentials = getRoleCredentials(role);

  test.describe(`Smoke panel — ${role}`, () => {
    test.skip(
      !credentials,
      `Define E2E_${role.toUpperCase()}_USER y E2E_${role.toUpperCase()}_PASSWORD para ejecutar este smoke`,
    );

    test(`login y shell de ${role}`, async ({ page }) => {
      if (!credentials) {
        return;
      }

      await loginAs(page, credentials);
      await expectPanelShell(page, credentials);
      await expect(page).toHaveURL(new RegExp(credentials.homePath));
    });

    const sections = SECTION_SMOKE[role] ?? [];
    for (const sectionPath of sections) {
      test(`navega a ${sectionPath}`, async ({ page }) => {
        if (!credentials) {
          return;
        }

        await loginAs(page, credentials);
        const response = await page.goto(sectionPath);
        expect(response?.status()).toBeLessThan(500);
        await expect(page).toHaveURL(new RegExp(sectionPath.replace(/\//g, "\\/")));
        await expectPanelShell(page, credentials);
      });
    }
  });
}
