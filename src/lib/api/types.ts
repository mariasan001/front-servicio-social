export type ApiResponse<T> = {
  success: boolean;
  code: string;
  message: string;
  data: T | null;
  errors?: unknown;
  path?: string;
  timestamp?: string;
};

export type LoginRequest = {
  username: string;
  password: string;
};

export type AuthUser = {
  idUsuario: number;
  username: string;
  nombreCompleto: string;
  correo: string;
  roles: string[];
  activo: boolean;
};

export type RegistroAlumnoConTokenRequest = {
  token: string;
  username: string;
  password: string;
  nombreCompleto: string;
  correo: string;
  telefono?: string;
  curp?: string;
  carrera?: string;
  semestreCuatrimestre?: number;
  numeroSeguroEstudiantil?: string;
  modalidadInteres: string;
  aceptaAvisoPrivacidad: boolean;
};

export type RegistroAlumnoSinTokenRequest = {
  username: string;
  password: string;
  nombreCompleto: string;
  correo: string;
  telefono?: string;
  curp?: string;
  escuelaTextoCapturada: string;
  carrera?: string;
  semestreCuatrimestre?: number;
  numeroSeguroEstudiantil?: string;
  modalidadInteres: string;
  aceptaAvisoPrivacidad: boolean;
};

export type RegistroAlumnoResponse = {
  idAlumno: number;
  username: string;
  requiereNormalizacionEscuela: boolean;
  mensaje: string;
};

export type ValidarTokenRegistroResponse = {
  valido: boolean;
  escuelaId?: number;
  nombreEscuela?: string;
  mensaje?: string;
};

export type ForgotPasswordRequest = {
  usernameOrEmail: string;
};

export type ResetPublicPasswordRequest = {
  token: string;
  newPassword: string;
};

export type ReportPageResponse<T> = {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
};
