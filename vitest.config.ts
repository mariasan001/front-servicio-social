import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["e2e/**", "node_modules/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      include: [
        "src/lib/domain/**/*.ts",
        "src/lib/actions/normalize-server-args.ts",
        "src/lib/auth/roles.ts",
        "src/lib/auth/postulacion-entry.ts",
        "src/lib/constants/upload.ts",
        "src/lib/seo/og.ts",
        "src/lib/utils/search.ts",
        "src/lib/utils/download-file.ts",
        "src/lib/api/query.ts",
        "src/lib/api/errors.ts",
        "src/features/auth/validation/**/*.ts",
        "src/features/admin/components/escuelas/invitation-link.ts",
        "src/features/landing/lib/public-vacantes.ts",
        "src/features/landing/lib/job-posting-jsonld.ts",
        "src/features/landing/lib/public-data.ts",
        "src/shared/components/DataTable/pagination.utils.ts",
        "src/shared/components/DataTable/column-widths.ts",
        "src/shared/components/DashboardChart/dashboard-chart.utils.ts",
        "src/shared/proceso/horas/horas-calendar.utils.ts",
      ],
      exclude: [
        "src/lib/site.ts",
        "src/lib/domain/index.ts",
        "src/lib/domain/labels.ts",
      ],
      thresholds: {
        lines: 85,
        functions: 85,
        branches: 80,
        statements: 85,
      },
    },
    globals: false,
  },
});
