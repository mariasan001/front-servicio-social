import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";

const envFile = ".env.local";
const nodeArgs = existsSync(envFile) ? [`--env-file=${envFile}`] : [];

const result = spawnSync(
  process.execPath,
  [
    ...nodeArgs,
    "./node_modules/@playwright/test/cli.js",
    "test",
    "e2e/panel-smoke.spec.ts",
    "e2e/accessibility-panel.spec.ts",
  ],
  {
    stdio: "inherit",
    env: process.env,
  },
);

process.exit(result.status ?? 1);
