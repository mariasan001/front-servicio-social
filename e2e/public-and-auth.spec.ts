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

  test("restablecer con token en path muestra formulario", async ({ page }) => {
    await page.goto("/restablecer-contrasena/enlace-de-prueba");
    await expect(page.getByRole("textbox", { name: "Nueva contraseña" })).toBeVisible();
    await expect(page.getByRole("button", { name: /restablecer contraseña/i })).toBeVisible();
  });

  test("registro muestra formulario de cuenta", async ({ page }) => {
    await page.goto("/registro");
    await expect(page.getByRole("heading", { name: /crear cuenta/i })).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Usuario" })).toBeVisible();
    await expect(page.getByRole("button", { name: /crear cuenta/i })).toBeVisible();
  });

  test("registro con token en path muestra formulario", async ({ page }) => {
    await page.goto("/registro/enlace-de-prueba");
    await expect(page.getByRole("heading", { name: /crear cuenta/i })).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Usuario" })).toBeVisible();
  });

  test("registro con token en query redirige a path", async ({ page }) => {
    await page.goto("/registro?token=enlace-de-prueba");
    await expect(page).toHaveURL(/\/registro\/enlace-de-prueba/);
  });
});

test.describe("Operación", () => {
  test("health check responde ok o degraded", async ({ request }) => {
    const response = await request.get("/api/health");
    expect(response.ok()).toBeTruthy();
    const body = (await response.json()) as {
      status: string;
      service: string;
      backend: string;
    };
    expect(["ok", "degraded"]).toContain(body.status);
    expect(body.service).toBe("front-servicio-social");
    expect(["up", "down"]).toContain(body.backend);
  });
});

test.describe("Protección del panel", () => {
  for (const path of [
    "/panel/alumno",
    "/panel/admin",
    "/panel/delegacion",
    "/panel/titular",
    "/panel/enlace",
  ]) {
    test(`${path} redirige a login sin sesión`, async ({ page }) => {
      await page.goto(path);
      await expect(page).toHaveURL(/\/login/);
    });
  }
});

test.describe("SEO y a11y básica", () => {
  test("landing expone skip link al contenido", async ({ page }) => {
    await page.goto("/");
    const skip = page.getByRole("link", { name: /saltar al contenido principal/i });
    await expect(skip).toHaveAttribute("href", "#main");
  });

  test("robots.txt permite vacantes y bloquea panel", async ({ request }) => {
    const response = await request.get("/robots.txt");
    expect(response.ok()).toBeTruthy();
    const body = await response.text();
    expect(body).toMatch(/Allow:\s*\/vacantes/i);
    expect(body).toMatch(/Disallow:\s*\/panel/i);
  });

  test("sitemap.xml responde", async ({ request }) => {
    const response = await request.get("/sitemap.xml");
    expect(response.ok()).toBeTruthy();
    const body = await response.text();
    expect(body).toContain("<urlset");
  });

  test("login vacío muestra validación", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: /iniciar sesión/i }).click();
    await expect(page.getByText(/usuario|contraseña|obligator|ingresa/i).first()).toBeVisible();
  });

  test("recuperar vacío muestra validación", async ({ page }) => {
    await page.goto("/recuperar-contrasena");
    await page.getByRole("button", { name: /enviar enlace/i }).click();
    await expect(page.getByText(/usuario|correo|ingresa/i).first()).toBeVisible();
  });

  test("registro vacío muestra validación", async ({ page }) => {
    await page.goto("/registro");
    await page.getByRole("button", { name: /crear cuenta/i }).click();
    await expect(page.getByText(/usuario|contraseña|ingresa|acept/i).first()).toBeVisible();
  });

  test("og image por defecto está disponible", async ({ request }) => {
    const response = await request.get("/images/og-default.png");
    expect(response.ok()).toBeTruthy();
    expect(response.headers()["content-type"]).toMatch(/image\/png/i);
  });

  test("manifest web responde", async ({ request }) => {
    const response = await request.get("/manifest.webmanifest");
    if (response.status() === 404) {
      const alt = await request.get("/manifest.json");
      expect(alt.status()).toBeLessThan(500);
      return;
    }
    expect(response.ok()).toBeTruthy();
  });
});
