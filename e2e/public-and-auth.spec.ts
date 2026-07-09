import { test, expect } from "@playwright/test";

test.describe("Rutas públicas", () => {
  test("landing carga con título institucional", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Servicio Social|Gobierno/i);
  });

  test("directorio de vacantes responde", async ({ page }) => {
    const response = await page.goto("/vacantes");
    expect(response?.status()).toBeLessThan(500);
  });
});

test.describe("Autenticación pública", () => {
  test("login muestra formulario de acceso", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("textbox", { name: "Usuario" })).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Contraseña" })).toBeVisible();
    await expect(page.getByRole("link", { name: /olvidaste|recuperar/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /iniciar sesión/i })).toBeVisible();
  });

  test("recuperar contraseña muestra formulario de solicitud", async ({ page }) => {
    await page.goto("/recuperar-contrasena");
    await expect(page.getByLabel(/usuario o correo/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /enviar enlace/i })).toBeVisible();
  });

  test("restablecer sin token muestra enlace inválido", async ({ page }) => {
    await page.goto("/restablecer-contrasena");
    await expect(page.getByText(/enlace no válido|no es válido/i)).toBeVisible();
  });

  test("registro muestra formulario de cuenta", async ({ page }) => {
    await page.goto("/registro");
    await expect(page.getByRole("heading", { name: /crear cuenta/i })).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Usuario" })).toBeVisible();
    await expect(page.getByRole("button", { name: /crear cuenta/i })).toBeVisible();
  });
});

test.describe("Protección del panel", () => {
  test("panel alumno redirige a login sin sesión", async ({ page }) => {
    await page.goto("/panel/alumno");
    await expect(page).toHaveURL(/\/login/);
  });
});
