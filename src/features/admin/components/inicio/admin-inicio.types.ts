export type AdminInicioStats = {
  dependencias: { total: number; activas: number };
  areas: { total: number; activas: number };
  escuelas: { total: number; activas: number };
  usuarios: { total: number; activos: number };
};

export type ConvenioBreakdown = {
  sinConvenio: number;
  vigente: number;
  vencido: number;
};

export type DependenciaAreaCount = {
  nombre: string;
  count: number;
};

export type AdminInicioDashboardData = {
  stats: AdminInicioStats;
  convenio: ConvenioBreakdown;
  areasPorDependencia: DependenciaAreaCount[];
};
