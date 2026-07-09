import { describe, expect, it } from "vitest";
import {
  validateResetEmailForm,
  validateResetPasswordForm,
} from "@/features/auth/validation/password-reset.validation";

describe("validateResetEmailForm", () => {
  it("exige usuario o correo", () => {
    expect(validateResetEmailForm({ usernameOrEmail: "" }).usernameOrEmail).toBeDefined();
    expect(validateResetEmailForm({ usernameOrEmail: "alumno@test.edu.mx" })).toEqual({});
  });

  it("valida longitud máxima", () => {
    expect(
      validateResetEmailForm({ usernameOrEmail: "a".repeat(200) }).usernameOrEmail,
    ).toBeDefined();
  });
});

describe("validateResetPasswordForm", () => {
  it("exige contraseña válida y confirmación coincidente", () => {
    expect(validateResetPasswordForm({ password: "", confirmPassword: "" }).password).toBeDefined();
    expect(
      validateResetPasswordForm({ password: "abc", confirmPassword: "abc" }).password,
    ).toBeDefined();
    expect(
      validateResetPasswordForm({ password: "Segura123!", confirmPassword: "Otra123!" })
        .confirmPassword,
    ).toBeDefined();
    expect(
      validateResetPasswordForm({ password: "Segura123!", confirmPassword: "Segura123!" }),
    ).toEqual({});
  });
});
