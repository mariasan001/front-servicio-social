export type DependenciaResponse = {
  idDependencia: number;
  clave?: string;
  nombre: string;
  nombreNormalizado?: string;
  siglas?: string;
  descripcion?: string;
  activa?: boolean;
  fechaCreacion?: string;
  fechaActualizacion?: string;
};

export type CrearDependenciaRequest = {
  clave?: string;
  nombre: string;
  siglas?: string;
  descripcion?: string;
};

export type ActualizarDependenciaRequest = {
  clave?: string;
  nombre?: string;
  siglas?: string;
  descripcion?: string;
};

export type ListDependenciasFilters = {
  nombre?: string;
  activa?: boolean;
};
