export type TitularInicioStats = {
  vacantes: {
    total: number;
    publicadas: number;
    enRevision: number;
    enCaptura: number;
  };
  postulaciones: {
    total: number;
    pendientes: number;
    resueltas: number;
  };
  procesos: {
    total: number;
    activos: number;
  };
  incidencias: {
    total: number;
    abiertas: number;
  };
};

export type VacanteEstatusBreakdown = {
  enCaptura: number;
  enRevision: number;
  publicadas: number;
  cerradas: number;
};

export type EstatusCount = {
  nombre: string;
  count: number;
};

export type TitularInicioDashboardData = {
  stats: TitularInicioStats;
  vacantesPorEstatus: VacanteEstatusBreakdown;
  postulacionesPorEstatus: EstatusCount[];
};
