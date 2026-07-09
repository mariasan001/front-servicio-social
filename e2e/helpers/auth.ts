import { expect, type Page } from "@playwright/test";

export type E2ERole = "admin" | "alumno" | "delegacion" | "titular" | "enlace";

type RoleCredentials = {
  username: string;
  password: string;
  homePath: string;
  roleLabel: string;
};

const ROLE_ENV: Record<
  E2ERole,
  { userKey: string; passKey: string; homePath: string; roleLabel: string }
> = {
  admin: {
    userKey: "E2E_ADMIN_USER",
    passKey: "E2E_ADMIN_PASSWORD",
    homePath: "/panel/admin",
    roleLabel: "Administración",
  },
  alumno: {
    userKey: "E2E_ALUMNO_USER",
    passKey: "E2E_ALUMNO_PASSWORD",
    homePath: "/panel/alumno",
    roleLabel: "Alumno",
  },
  delegacion: {
    userKey: "E2E_DELEGACION_USER",
    passKey: "E2E_DELEGACION_PASSWORD",
    homePath: "/panel/delegacion",
    roleLabel: "Delegación",
  },
  titular: {
    userKey: "E2E_TITULAR_USER",
    passKey: "E2E_TITULAR_PASSWORD",
    homePath: "/panel/titular",
    roleLabel: "Titular de área",
  },
  enlace: {
    userKey: "E2E_ENLACE_USER",
    passKey: "E2E_ENLACE_PASSWORD",
    homePath: "/panel/enlace",
    roleLabel: "Enlace escolar",
  },
};

export function getRoleCredentials(role: E2ERole): RoleCredentials | null {
  const config = ROLE_ENV[role];
  const username = process.env[config.userKey]?.trim() ?? "";
  const password = process.env[config.passKey]?.trim() ?? "";

  if (!username || !password) {
    return null;
  }

  return {
    username,
    password,
    homePath: config.homePath,
    roleLabel: config.roleLabel,
  };
}

export async function loginAs(page: Page, credentials: RoleCredentials) {
  await page.goto("/login");
  await page.getByRole("textbox", { name: "Usuario" }).fill(credentials.username);
  await page.getByLabel("Contraseña", { exact: true }).fill(credentials.password);
  await page.getByRole("button", { name: /iniciar sesión/i }).click();
  await expect(page).toHaveURL(new RegExp(credentials.homePath.replace(/\//g, "\\/")), {
    timeout: 30_000,
  });
}

export async function expectPanelShell(page: Page, credentials: RoleCredentials) {
  await expect(page.getByRole("complementary", { name: /menú del panel/i })).toBeVisible();
  await expect(page.getByText(credentials.roleLabel, { exact: true }).first()).toBeVisible();
}
