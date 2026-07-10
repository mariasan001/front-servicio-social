import { chromium } from "@playwright/test";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const htmlPath = path.join(root, "scripts", "og-default.html");
const outPath = path.join(root, "public", "images", "og-default.png");

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1200, height: 630 },
  deviceScaleFactor: 1,
});

await page.goto(`file://${htmlPath.replaceAll("\\", "/")}`, {
  waitUntil: "networkidle",
});
await page.evaluate(() => document.fonts.ready);
await page.locator(".frame").screenshot({ path: outPath, type: "png" });
await browser.close();

console.log(`Wrote ${outPath}`);
