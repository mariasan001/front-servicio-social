import type { TitularAreaResponse } from "./titular.types";

export type AreaResponse = {
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

export type AreaDetalleResponse = AreaResponse & {
  titulares?: TitularAreaResponse[];
};

export type CrearAreaRequest = {
  dependenciaId: number;
  nombre: string;
  descripcion?: string;
  ubicacion?: string;
  correoContacto?: string;
  telefonoContacto?: string;
};

export type ActualizarAreaRequest = Partial<CrearAreaRequest>;

export type ListAreasFilters = {
  dependenciaId?: number;
  nombre?: string;
  activa?: boolean;
};
