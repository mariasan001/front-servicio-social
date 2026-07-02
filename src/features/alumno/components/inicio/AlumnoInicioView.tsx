"use client";

import Link from "next/link";
import { Briefcase, ClipboardList, FileText, Layers, UserCircle } from "lucide-react";
import { PANEL_PATHS } from "@/lib/auth/constants";
import type { AuthUser } from "@/lib/api/types";
import type { ProcesoDetalleResponse } from "../../types/alumno.types";
import { estatusTone, formatEtiqueta } from "@/lib/domain/labels";
import { PageHeader } from "@/shared/components/PageHeader";
import { StatusBadge } from "@/shared/components/StatusBadge";
import styles from "@/shared/styles/PanelSectionView.module.css";
import inicioStyles from "@/shared/styles/PanelInicioView.module.css";

type AlumnoInicioViewProps = {
  session: AuthUser;
  procesoActual: ProcesoDetalleResponse | null;
  notificacionesNoLeidas: number;
  stats: {
    vacantes: number;
    postulaciones: number;
  };
};

const QUICK_ACCESS = [
  {
    href: `${PANEL_PATHS.alumno}/vacantes`,
    label: "Vacantes",
    description: "Explora oportunidades disponibles y postúlate.",
    icon: Briefcase,
    statKey: "vacantes" as const,
    statLabel: "disponibles",
  },
  {
    href: `${PANEL_PATHS.alumno}/postulaciones`,
    label: "Postulaciones",
    description: "Consulta el estatus de tus solicitudes.",
    icon: ClipboardList,
    statKey: "postulaciones" as const,
    statLabel: "registradas",
  },
  {
    href: `${PANEL_PATHS.alumno}/proceso`,
    label: "Mi proceso",
    description: "Seguimiento de horas, documentos y avance.",
    icon: FileText,
    statKey: null,
    statLabel: "activo",
    useProceso: true,
  },
  {
    href: `${PANEL_PATHS.alumno}/cv`,
    label: "Mi CV",
    description: "Mantén actualizado tu perfil profesional.",
    icon: UserCircle,
    statKey: null,
    statLabel: "perfil",
    staticValue: "—",
  },
  {
    href: `${PANEL_PATHS.alumno}/notificaciones`,
    label: "Notificaciones",
    description: "Avisos y actualizaciones del sistema.",
    icon: Layers,
    statKey: null,
    statLabel: "sin leer",
    useNotificaciones: true,
  },
];

export function AlumnoInicioView({
  session,
  procesoActual,
  notificacionesNoLeidas,
  stats,
}: AlumnoInicioViewProps) {
  const firstName = session.nombreCompleto.trim().split(/\s+/)[0] ?? session.nombreCompleto;

  return (
    <section className={styles.page} aria-labelledby="alumno-inicio-title">
      <PageHeader
        titleId="alumno-inicio-title"
        eyebrow="Alumno"
        title={`Hola, ${firstName}`}
        description="Resumen de tu participación en servicio social o residencia profesional."
      />

      <div className={inicioStyles.welcomeCard}>
        <p className={inicioStyles.welcomeText}>
          Desde este panel puedes postularte a vacantes, dar seguimiento a tu proceso y mantener
          tu información al día.
        </p>
        {procesoActual ? (
          <p className={inicioStyles.welcomeText}>
            Proceso activo:{" "}
            <strong>{procesoActual.folio?.trim() || `#${procesoActual.idProceso}`}</strong>{" "}
            <StatusBadge tone={estatusTone(procesoActual.estatus)}>
              {formatEtiqueta(procesoActual.estatus)}
            </StatusBadge>
          </p>
        ) : (
          <p className={inicioStyles.welcomeText}>
            Aún no tienes un proceso activo. Revisa las vacantes disponibles para comenzar.
          </p>
        )}
      </div>

      <div className={styles.summaryRow}>
        <div className={styles.summaryCard}>
          <span className={styles.summaryValue}>{stats.postulaciones}</span>
          <span className={styles.summaryLabel}>Postulaciones</span>
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.summaryValue}>{stats.vacantes}</span>
          <span className={styles.summaryLabel}>Vacantes disponibles</span>
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.summaryValue}>{notificacionesNoLeidas}</span>
          <span className={styles.summaryLabel}>Notificaciones sin leer</span>
        </div>
      </div>

      <div className={inicioStyles.sectionHeader}>
        <h2 className={inicioStyles.sectionTitle}>Accesos rápidos</h2>
      </div>

      <div className={inicioStyles.cardGrid}>
        {QUICK_ACCESS.map((item) => {
          const Icon = item.icon;
          let value: string | number = "—";

          if (item.useProceso) {
            value = procesoActual ? 1 : 0;
          } else if (item.useNotificaciones) {
            value = notificacionesNoLeidas;
          } else if (item.statKey) {
            value = stats[item.statKey];
          } else if (item.staticValue) {
            value = item.staticValue;
          }

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
