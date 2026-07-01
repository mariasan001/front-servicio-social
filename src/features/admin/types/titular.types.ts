export type TitularAreaResponse = {
  idAsignacion: number;
  idArea: number;
  idUsuario: number;
  username?: string;
  nombreCompleto?: string;
  correo?: string;
  esPrincipal?: boolean;
  vigente?: boolean;
  fechaInicio?: string;
  fechaFin?: string;
  fechaCreacion?: string;
  fechaActualizacion?: string;
};

export type AsignarTitularAreaRequest = {
  usuarioId: number;
  esPrincipal?: boolean;
};
