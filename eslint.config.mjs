import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const ROLE_FEATURES = ["admin", "alumno", "delegacion", "titular", "enlace", "landing"];

/** Bloquea imports cruzados entre features de rol (panel/auth sí pueden usarse). */
function roleBoundaryOverrides() {
  return ROLE_FEATURES.map((role) => {
    const otherRoles = ROLE_FEATURES.filter((item) => item !== role);
    return {
      files: [`src/features/${role}/**/*.{ts,tsx}`],
      rules: {
        "no-restricted-imports": [
          "error",
          {
            patterns: otherRoles.map((other) => ({
              group: [`@/features/${other}`, `@/features/${other}/*`],
              message: `No importar features/${other} desde features/${role}. Usa shared/, lib/ o panel/auth según el caso.`,
            })),
          },
        ],
      },
    };
  });
}

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  ...roleBoundaryOverrides(),
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "coverage/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
