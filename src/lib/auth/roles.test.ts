import { describe, expect, it } from "vitest";
import { USER_ROLES } from "@/lib/auth/constants";
import {
  canAccessPath,
  getPrimaryRole,
  getRequiredRolesForPath,
  hasAnyRole,
  isSafeInternalPath,
  normalizeAuthUser,
  normalizeRole,
  normalizeRoles,
  resolveHomePath,
} from "@/lib/auth/roles";

const alumnoUser = {
  idUsuario: 1,
  username: "alumno1",
  nombreCompleto: "Alumno Uno",
  correo: "a@test.com",
  roles: ["ROLE_ALUMNO"],
  activo: true,
};

describe("normalizeRole", () => {
  it("acepta con y sin prefijo ROLE_", () => {
    expect(normalizeRole("ROLE_ALUMNO")).toBe(USER_ROLES.ALUMNO);
    expect(normalizeRole("ALUMNO")).toBe(USER_ROLES.ALUMNO);
    expect(normalizeRole("invalido")).toBeNull();
  });
});

describe("normalizeRoles y hasAnyRole", () => {
  it("filtra roles inválidos", () => {
    expect(normalizeRoles(["ALUMNO", "X", "DELEGACION"])).toEqual([
      USER_ROLES.ALUMNO,
      USER_ROLES.DELEGACION,
    ]);
  });

  it("hasAnyRole con roles normalizados", () => {
    expect(hasAnyRole(["ALUMNO"], [USER_ROLES.ALUMNO])).toBe(true);
    expect(hasAnyRole(["TITULAR_AREA"], [USER_ROLES.DELEGACION])).toBe(false);
  });
});

describe("getPrimaryRole y resolveHomePath", () => {
  it("prioriza según ROLE_PRIORITY", () => {
    expect(getPrimaryRole(["ROLE_ALUMNO", "ROLE_ADMINISTRADOR"])).toBe(
      USER_ROLES.ADMINISTRADOR,
    );
    expect(resolveHomePath(["ALUMNO"])).toBe("/panel/alumno");
  });

  it("normalizeAuthUser normaliza roles del usuario", () => {
    const user = normalizeAuthUser({ ...alumnoUser, roles: ["ALUMNO"] });
    expect(user.roles).toEqual([USER_ROLES.ALUMNO]);
  });
});

describe("getRequiredRolesForPath", () => {
  it("resuelve roles por prefijo de panel", () => {
    expect(getRequiredRolesForPath("/panel/delegacion/vacantes")).toEqual([
      USER_ROLES.DELEGACION,
    ]);
    expect(getRequiredRolesForPath("/panel/alumno/cv")).toEqual([USER_ROLES.ALUMNO]);
    expect(getRequiredRolesForPath("/login")).toBeNull();
  });
});

describe("canAccessPath", () => {
  it("deniega sin usuario", () => {
    expect(canAccessPath(null, "/panel/alumno")).toBe(false);
  });

  it("permite acceso con rol correcto", () => {
    expect(canAccessPath(alumnoUser, "/panel/alumno/vacantes")).toBe(true);
    expect(canAccessPath(alumnoUser, "/panel/admin")).toBe(false);
  });

  it("permite /panel genérico a usuarios autenticados", () => {
    expect(canAccessPath(alumnoUser, "/panel")).toBe(true);
  });
});

describe("isSafeInternalPath", () => {
  it("acepta rutas internas conocidas", () => {
    expect(isSafeInternalPath("/panel/alumno/vacantes")).toBe(true);
    expect(isSafeInternalPath("/vacantes/123")).toBe(true);
    expect(isSafeInternalPath("/")).toBe(true);
    expect(isSafeInternalPath("/registro/token-abc")).toBe(true);
  });

  it("rechaza pantallas guest-only, externos y open-redirect", () => {
    expect(isSafeInternalPath("/login")).toBe(false);
    expect(isSafeInternalPath("/recuperar-contrasena")).toBe(false);
    expect(isSafeInternalPath("/restablecer-contrasena")).toBe(false);
    expect(isSafeInternalPath("https://evil.com")).toBe(false);
    expect(isSafeInternalPath("//evil.com")).toBe(false);
    expect(isSafeInternalPath(null)).toBe(false);
    expect(isSafeInternalPath("/desconocido")).toBe(false);
  });
});
