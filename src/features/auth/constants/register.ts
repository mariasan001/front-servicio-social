import {
  MODALIDAD_CATALOGO_OPTIONS,
  type ModalidadCatalogoValue,
} from "@/lib/domain/modalidad";

export const MODALIDAD_INTERES_OPTIONS = MODALIDAD_CATALOGO_OPTIONS;

export type ModalidadInteresValue = ModalidadCatalogoValue;

export const PASSWORD_MIN_LENGTH = 8;
export const USERNAME_MAX_LENGTH = 100;
export const NOMBRE_MAX_LENGTH = 250;
export const CORREO_MAX_LENGTH = 150;
export const TELEFONO_MAX_LENGTH = 30;
export const CURP_MAX_LENGTH = 18;
export const CARRERA_MAX_LENGTH = 180;
export const ESCUELA_MAX_LENGTH = 255;
export const SEGURO_MAX_LENGTH = 50;

export const REGISTER_SCHOOL_COPY = {
  linkedTitle: "Institución vinculada por invitación",
  linkedHint:
    "Esta escuela viene en tu enlace de registro. Quedará asignada a tu cuenta y no podrás cambiarla aquí.",
  manualLabel: "Institución educativa",
  manualHint:
    "Captúrala tal como aparece en tu credencial. Si aún no está en el catálogo, la delegación la vinculará al revisar tu registro.",
  manualNote:
    "Sin enlace de invitación puedes registrarte igual; solo necesitamos el nombre correcto de tu escuela.",
  invalidTokenTitle: "Enlace de invitación no válido",
  invalidTokenBody:
    "El enlace expiró, ya se usó o no corresponde a una escuela activa. Pide uno nuevo en tu institución o regístrate capturando tu escuela manualmente.",
  invalidTokenAction: "Registrarme sin invitación",
  validatingToken: "Validando enlace de invitación…",
} as const;
