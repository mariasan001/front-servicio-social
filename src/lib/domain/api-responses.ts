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

export type AreaCatalogResponse = {
  idArea: number;
  dependenciaId: number;
  dependenciaNombre?: string;
  nombre: string;
  descripcion?: string;
  ubicacion?: string;
  correoContacto?: string;
  telefonoContacto?: string;
  activa?: boolean;
  fechaCreacion?: string;
  fechaActualizacion?: string;
};

export type TitularAreaCatalogResponse = {
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

export type DocumentoEstatusResponse = {
  idProcesoDocumento: number;
  tipoDocumento?: string;
  nombreDocumento?: string;
  estatus?: string;
  obligatorio?: boolean;
};

export type CartaMetadataResponse = {
  idCarta: number;
  tipoCarta?: string;
  folio?: string;
  estatus?: string;
  fechaEmision?: string;
};
