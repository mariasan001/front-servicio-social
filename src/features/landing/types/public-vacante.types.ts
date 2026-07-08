import type { VacanteBase } from "@/lib/domain";

export type PublicVacanteResponse = VacanteBase & {
  areaId?: number;
  areaNombre?: string;
  dependenciaId?: number;
  dependenciaNombre?: string;
  modalidadId?: string;
  modalidadTrabajo?: string;
  cupoTotal?: number;
  cupoDisponible?: number;
  requiereExamen?: boolean;
  fechaPublicacion?: string;
};

export type PublicVacanteDetalleResponse = PublicVacanteResponse & {
  descripcion?: string;
  perfilRequerido?: string;
  nivelEducativo?: string;
  tipoHorario?: string;
  diasDisponibles?: string;
  horario?: string;
  direccion?: string;
};
