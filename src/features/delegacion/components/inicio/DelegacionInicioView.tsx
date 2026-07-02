"use client";

import Link from "next/link";
import {
  BarChart3,
  Briefcase,
  ClipboardList,
  Clock,
  FileText,
  Shield,
  Users,
} from "lucide-react";
import { PANEL_PATHS } from "@/lib/auth/constants";
import type { AuthUser } from "@/lib/api/types";
import type {
  DashboardResponse,
  LiberacionPendienteCartaResponse,
  NotificacionCorreoResponse,
} from "../../types/delegacion.types";
import { estatusTone, formatEtiqueta } from "@/lib/domain/labels";
import { PageHeader } from "@/shared/components/PageHeader";
import { StatusBadge } from "@/shared/components/StatusBadge";
import styles from "@/shared/styles/PanelSectionView.module.css";
import inicioStyles from "./DelegacionInicioView.module.css";

type DelegacionInicioViewProps = {
  session: AuthUser;
  dashboard: DashboardResponse;
  liberacionesPendientes: LiberacionPendienteCartaResponse[];
  notificacionesRecientes: NotificacionCorreoResponse[];
};

const QUICK_ACCESS = [
  {
    href: `${PANEL_PATHS.delegacion}/vacantes`,
    label: "Vacantes",
    description: "Revisa y gestiona las vacantes del programa.",
    icon: Briefcase,
    statKey: "vacantesPublicadas" as const,
    statLabel: "publicadas",
  },
  {
    href: `${PANEL_PATHS.delegacion}/postulaciones`,
    label: "Postulaciones",
    description: "Consulta el seguimiento de postulaciones.",
    icon: ClipboardList,
    statKey: "postulacionesPendientes" as const,
    statLabel: "pendientes",
  },
  {
    href: `${PANEL_PATHS.delegacion}/procesos`,
    label: "Procesos",
    description: "Supervisa los procesos activos de los alumnos.",
    icon: FileText,
    statKey: "procesosActivos" as const,
    statLabel: "activos",
  },
  {
    href: `${PANEL_PATHS.delegacion}/documentos`,
    label: "Documentos",
    description: "Atiende la documentación pendiente de revisión.",
    icon: FileText,
    statKey: "pendientesDocumentacion" as const,
    statLabel: "pendientes",
  },
  {
    href: `${PANEL_PATHS.delegacion}/horas`,
    label: "Horas",
    description: "Revisa los registros de horas por validar.",
    icon: Clock,
    statKey: "horasCompletas" as const,
    statLabel: "completas",
  },
  {
    href: `${PANEL_PATHS.delegacion}/incidencias`,
    label: "Incidencias",
    description: "Gestiona incidencias reportadas.",
    icon: Shield,
    statKey: "pendientesLiberacion" as const,
    statLabel: "pend. liberación",
  },
  {
    href: `${PANEL_PATHS.delegacion}/alumnos`,
    label: "Alumnos",
    description: "Normaliza escuelas de alumnos registrados.",
    icon: Users,
    statKey: "totalAlumnos" as const,
    statLabel: "en programa",
  },
  {
    href: `${PANEL_PATHS.delegacion}/reportes`,
    label: "Reportes",
    description: "Consulta indicadores y descarga reportes.",
    icon: BarChart3,
    statKey: "liberados" as const,
    statLabel: "liberados",
  },
];

export function DelegacionInicioView({
  session,
  dashboard,
  liberacionesPendientes,
  notificacionesRecientes,
}: DelegacionInicioViewProps) {
  const firstName = session.nombreCompleto.trim().split(/\s+/)[0] ?? session.nombreCompleto;

  return (
    <section className={styles.page} aria-labelledby="delegacion-inicio-title">
      <PageHeader
        titleId="delegacion-inicio-title"
        eyebrow="Delegación"
        title={`Hola, ${firstName}`}
        description="Resumen operativo del programa de servicio social y residencia."
      />

      <div className={inicioStyles.welcomeCard}>
        <p className={inicioStyles.welcomeText}>
          Tienes acceso al panel de <strong>Delegación</strong>. Desde aquí puedes dar
          seguimiento a vacantes, procesos, documentación, horas e incidencias.
        </p>
      </div>

      <div className={styles.summaryRow}>
        <div className={styles.summaryCard}>
          <span className={styles.summaryValue}>{dashboard.procesosActivos}</span>
          <span className={styles.summaryLabel}>Procesos activos</span>
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.summaryValue}>{dashboard.pendientesDocumentacion}</span>
          <span className={styles.summaryLabel}>Documentos pendientes</span>
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.summaryValue}>{dashboard.postulacionesPendientes}</span>
          <span className={styles.summaryLabel}>Postulaciones pendientes</span>
        </div>
      </div>

      {liberacionesPendientes.length > 0 ? (
        <section className={styles.detailSection} aria-labelledby="liberaciones-pendientes-title">
          <div className={styles.detailSectionHeader}>
            <h2 id="liberaciones-pendientes-title" className={styles.detailSectionTitle}>
              Liberaciones pendientes de carta
            </h2>
            <p className={styles.detailSectionDescription}>
              Procesos que requieren emisión de carta de liberación.
            </p>
          </div>
          <ul className={styles.titularList}>
            {liberacionesPendientes.slice(0, 5).map((item) => (
              <li key={item.idProceso} className={styles.titularCard}>
                <strong>{item.alumnoNombre ?? "Alumno sin nombre"}</strong>
                <p className={styles.titularMeta}>
                  Proceso {item.folio?.trim() || `#${item.idProceso}`}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {notificacionesRecientes.length > 0 ? (
        <section className={styles.detailSection} aria-labelledby="notificaciones-correo-title">
          <div className={styles.detailSectionHeader}>
            <h2 id="notificaciones-correo-title" className={styles.detailSectionTitle}>
              Notificaciones por correo
            </h2>
            <p className={styles.detailSectionDescription}>
              Últimos envíos registrados en el sistema.
            </p>
          </div>
          <ul className={styles.titularList}>
            {notificacionesRecientes.map((notificacion, index) => (
              <li
                key={notificacion.id ?? `${notificacion.destino ?? "correo"}-${index}`}
                className={styles.titularCard}
              >
                <div className={styles.titularHeader}>
                  <strong>{notificacion.asunto?.trim() || "Sin asunto"}</strong>
                  <StatusBadge tone={estatusTone(notificacion.estatus)}>
                    {formatEtiqueta(notificacion.estatus, "Sin estatus")}
                  </StatusBadge>
                </div>
                <p className={styles.titularMeta}>
                  {notificacion.destino?.trim() || "Destino no registrado"}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className={inicioStyles.sectionHeader}>
        <h2 className={inicioStyles.sectionTitle}>Accesos rápidos</h2>
      </div>

      <div className={inicioStyles.cardGrid}>
        {QUICK_ACCESS.map((item) => {
          const Icon = item.icon;
          const value = dashboard[item.statKey];

          return (
            <Link key={item.href} href={item.href} className={inicioStyles.accessCard}>
              <span className={inicioStyles.accessIcon} aria-hidden="true">
                <Icon size={22} strokeWidth={2} />
              </span>
              <div className={inicioStyles.accessContent}>
                <h3 className={inicioStyles.accessTitle}>{item.label}</h3>
                <p className={inicioStyles.accessDescription}>{item.description}</p>
              </div>
              <div className={inicioStyles.accessStats}>
                <span className={inicioStyles.accessTotal}>{value}</span>
                <span className={inicioStyles.accessMeta}>{item.statLabel}</span>
              </div>
              <span className={inicioStyles.accessCta}>Entrar</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
