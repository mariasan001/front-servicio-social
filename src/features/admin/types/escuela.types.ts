export type EscuelaResponse = {
  idEscuela: number;
  clave?: string;
  nombreOficial: string;
  nombreCorto?: string;
  estatus?: string;
  convenioEstatus?: string;
  correoContacto?: string;
  municipio?: string;
};

export type EscuelaDetalleResponse = EscuelaResponse & {
  nombreNormalizado?: string;
  telefono?: string;
  domicilio?: string;
  fechaCreacion?: string;
  fechaActualizacion?: string;
};

export type CrearEscuelaRequest = {
  clave?: string;
  nombreOficial: string;
  nombreCorto?: string;
  correoContacto?: string;
  telefono?: string;
  municipio?: string;
  domicilio?: string;
  estatus?: string;
  convenioEstatus?: string;
};

export type ActualizarEscuelaRequest = Partial<
  Omit<CrearEscuelaRequest, "nombreOficial">
> & {
  nombreOficial?: string;
};

export type ListEscuelasFilters = {
  nombre?: string;
  estatus?: string;
  convenioEstatus?: string;
};

export type EscuelaTokenResponse = {
  idToken: number;
  escuelaId: number;
  tokenReferencia?: string;
  nombre?: string;
  estatus?: string;
  fechaExpiracion?: string;
  fechaSuspension?: string;
  fechaRevocacion?: string;
  fechaCreacion?: string;
};

export type GenerarTokenRequest = {
  nombre?: string;
  fechaExpiracion?: string;
  revocarTokensActivos?: boolean;
};

export type TokenGeneradoResponse = {
  idToken: number;
  token?: string;
  urlRegistro?: string;
  estatus?: string;
  fechaExpiracion?: string;
};
