import {
  CARRERA_MAX_LENGTH,
  CORREO_MAX_LENGTH,
  CURP_MAX_LENGTH,
  ESCUELA_MAX_LENGTH,
  NOMBRE_MAX_LENGTH,
  TELEFONO_MAX_LENGTH,
  USERNAME_MAX_LENGTH,
} from "../constants/register";
import { getPasswordComplexityError } from "./password-strength";

export type LoginFormValues = {
  username: string;
  password: string;
};

export type LoginFormErrors = Partial<Record<keyof LoginFormValues, string>>;

export function validateLoginForm(values: LoginFormValues): LoginFormErrors {
  const errors: LoginFormErrors = {};
  const username = values.username.trim();
  const password = values.password;

  if (!username) {
    errors.username = "Ingresa tu usuario.";
  } else if (username.length > USERNAME_MAX_LENGTH) {
    errors.username = `El usuario no puede superar ${USERNAME_MAX_LENGTH} caracteres.`;
  }

  if (!password) {
    errors.password = "Ingresa tu contraseña.";
  }

  return errors;
}

export type RegisterFormValues = {
  username: string;
  password: string;
  confirmPassword: string;
  nombreCompleto: string;
  correo: string;
  telefono: string;
  curp: string;
  escuelaTextoCapturada: string;
  carrera: string;
  semestreCuatrimestre: string;
  numeroSeguroEstudiantil: string;
  modalidadInteres: string;
  aceptaAvisoPrivacidad: boolean;
};

export type RegisterFormErrors = Partial<
  Record<keyof RegisterFormValues, string>
>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateRegisterForm(
  values: RegisterFormValues,
  options: { withToken: boolean },
): RegisterFormErrors {
  const errors: RegisterFormErrors = {};

  const username = values.username.trim();
  const password = values.password;
  const confirmPassword = values.confirmPassword;
  const nombreCompleto = values.nombreCompleto.trim();
  const correo = values.correo.trim();
  const telefono = values.telefono.trim();
  const curp = values.curp.trim().toUpperCase();
  const escuelaTextoCapturada = values.escuelaTextoCapturada.trim();
  const carrera = values.carrera.trim();
  const semestre = values.semestreCuatrimestre.trim();
  const seguro = values.numeroSeguroEstudiantil.trim();

  if (!username) {
    errors.username = "Ingresa un nombre de usuario.";
  } else if (username.length > USERNAME_MAX_LENGTH) {
    errors.username = `Máximo ${USERNAME_MAX_LENGTH} caracteres.`;
  }

  if (!password) {
    errors.password = "Ingresa una contraseña.";
  } else {
    const complexityError = getPasswordComplexityError(password);
    if (complexityError) {
      errors.password = complexityError;
    }
  }

  if (!confirmPassword) {
    errors.confirmPassword = "Confirma tu contraseña.";
  } else if (confirmPassword !== password) {
    errors.confirmPassword = "Las contraseñas no coinciden.";
  }

  if (!nombreCompleto) {
    errors.nombreCompleto = "Ingresa tu nombre completo.";
  } else if (nombreCompleto.length > NOMBRE_MAX_LENGTH) {
    errors.nombreCompleto = `Máximo ${NOMBRE_MAX_LENGTH} caracteres.`;
  }

  if (!correo) {
    errors.correo = "Ingresa tu correo electrónico.";
  } else if (!EMAIL_PATTERN.test(correo)) {
    errors.correo = "Ingresa un correo electrónico válido.";
  } else if (correo.length > CORREO_MAX_LENGTH) {
    errors.correo = `Máximo ${CORREO_MAX_LENGTH} caracteres.`;
  }

  if (telefono && telefono.length > TELEFONO_MAX_LENGTH) {
    errors.telefono = `Máximo ${TELEFONO_MAX_LENGTH} caracteres.`;
  }

  if (curp && curp.length > CURP_MAX_LENGTH) {
    errors.curp = `Máximo ${CURP_MAX_LENGTH} caracteres.`;
  }

  if (carrera.length > CARRERA_MAX_LENGTH) {
    errors.carrera = `Máximo ${CARRERA_MAX_LENGTH} caracteres.`;
  }

  if (!options.withToken) {
    if (!escuelaTextoCapturada) {
      errors.escuelaTextoCapturada = "Indica el nombre de tu institución educativa.";
    } else if (escuelaTextoCapturada.length > ESCUELA_MAX_LENGTH) {
      errors.escuelaTextoCapturada = `Máximo ${ESCUELA_MAX_LENGTH} caracteres.`;
    }
  }

  if (semestre) {
    const parsed = Number(semestre);
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 20) {
      errors.semestreCuatrimestre = "Ingresa un semestre o cuatrimestre entre 1 y 20.";
    }
  }

  if (seguro && seguro.length > 50) {
    errors.numeroSeguroEstudiantil = "Máximo 50 caracteres.";
  }

  if (!values.modalidadInteres) {
    errors.modalidadInteres = "Selecciona la modalidad de tu interés.";
  }

  if (!values.aceptaAvisoPrivacidad) {
    errors.aceptaAvisoPrivacidad =
      "Debes aceptar el aviso de privacidad para continuar.";
  }

  return errors;
}

export function hasFormErrors<T extends Record<string, string | undefined>>(
  errors: T,
) {
  return Object.values(errors).some(Boolean);
}
