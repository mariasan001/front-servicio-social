import { describe, expect, it } from "vitest";
import {
  hasFormErrors,
  validateLoginForm,
  validateRegisterForm,
  type RegisterFormValues,
} from "@/features/auth/validation/auth.validation";

const validRegister = (): RegisterFormValues => ({
  username: "alumno.test",
  password: "Segura123!",
  confirmPassword: "Segura123!",
  nombreCompleto: "Alumno Prueba",
  correo: "alumno@test.edu.mx",
  telefono: "5512345678",
  curp: "",
  escuelaTextoCapturada: "UAEMEX",
  carrera: "Informática",
  semestreCuatrimestre: "8",
  numeroSeguroEstudiantil: "",
  modalidadInteres: "PRESENCIAL",
  aceptaAvisoPrivacidad: true,
});

describe("validateLoginForm", () => {
  it("exige usuario y contraseña", () => {
    expect(validateLoginForm({ username: "", password: "" })).toMatchObject({
      username: expect.any(String),
      password: expect.any(String),
    });
    expect(validateLoginForm({ username: "user", password: "x" })).toEqual({});
  });

  it("valida longitud máxima de usuario", () => {
    const long = "a".repeat(200);
    expect(validateLoginForm({ username: long, password: "x" }).username).toBeDefined();
  });
});

describe("validateRegisterForm", () => {
  it("acepta registro válido sin token", () => {
    expect(validateRegisterForm(validRegister(), { withToken: false })).toEqual({});
  });

  it("con token no exige escuela manual", () => {
    const values = { ...validRegister(), escuelaTextoCapturada: "" };
    expect(validateRegisterForm(values, { withToken: true })).toEqual({});
  });

  it("sin token exige escuela", () => {
    const values = { ...validRegister(), escuelaTextoCapturada: "" };
    expect(validateRegisterForm(values, { withToken: false }).escuelaTextoCapturada).toBeDefined();
  });

  it("rechaza contraseñas cortas o distintas", () => {
    const short = { ...validRegister(), password: "abc", confirmPassword: "abc" };
    expect(validateRegisterForm(short, { withToken: true }).password).toBeDefined();

    const mismatch = { ...validRegister(), confirmPassword: "Otra123!" };
    expect(validateRegisterForm(mismatch, { withToken: true }).confirmPassword).toBeDefined();
  });

  it("valida correo y semestre", () => {
    const badEmail = { ...validRegister(), correo: "no-es-correo" };
    expect(validateRegisterForm(badEmail, { withToken: true }).correo).toBeDefined();

    const badSemester = { ...validRegister(), semestreCuatrimestre: "25" };
    expect(validateRegisterForm(badSemester, { withToken: true }).semestreCuatrimestre).toBeDefined();
  });

  it("exige aviso de privacidad y modalidad", () => {
    const noPrivacy = { ...validRegister(), aceptaAvisoPrivacidad: false };
    expect(validateRegisterForm(noPrivacy, { withToken: true }).aceptaAvisoPrivacidad).toBeDefined();

    const noModalidad = { ...validRegister(), modalidadInteres: "" };
    expect(validateRegisterForm(noModalidad, { withToken: true }).modalidadInteres).toBeDefined();
  });
});

describe("hasFormErrors", () => {
  it("detecta errores presentes", () => {
    expect(hasFormErrors({ a: "error", b: undefined })).toBe(true);
    expect(hasFormErrors({ a: undefined })).toBe(false);
  });
});
