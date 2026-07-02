"use client";

import Link from "next/link";
import { Briefcase, ClipboardList, FileText, Shield } from "lucide-react";
import { PANEL_PATHS } from "@/lib/auth/constants";
import type { AuthUser } from "@/lib/api/types";
import { PageHeader } from "@/shared/components/PageHeader";
import styles from "@/shared/styles/PanelSectionView.module.css";
import inicioStyles from "./TitularInicioView.module.css";

type TitularInicioStats = {
  vacantes: number;
  postulaciones: number;
  procesos: number;
  incidencias: number;
};

type TitularInicioViewProps = {
  session: AuthUser;
  stats: TitularInicioStats;
};

const QUICK_ACCESS = [
  {
    href: `${PANEL_PATHS.titular}/vacantes`,
    label: "Vacantes",
    description: "Crea y gestiona las vacantes de tu área.",
    icon: Briefcase,
    statKey: "vacantes" as const,
    statLabel: "registradas",
  },
  {
    href: `${PANEL_PATHS.titular}/postulaciones`,
    label: "Postulaciones",
    description: "Revisa y resuelve las postulaciones recibidas.",
    icon: ClipboardList,
    statKey: "postulaciones" as const,
    statLabel: "en seguimiento",
  },
  {
    href: `${PANEL_PATHS.titular}/procesos`,
    label: "Procesos",
    description: "Supervisa horas, incidencias y cierre de procesos.",
    icon: FileText,
    statKey: "procesos" as const,
    statLabel: "activos",
  },
  {
    href: `${PANEL_PATHS.titular}/incidencias`,
    label: "Incidencias",
    description: "Consulta incidencias reportadas en tu área.",
    icon: Shield,
    statKey: "incidencias" as const,
    statLabel: "registradas",
  },
];

export function TitularInicioView({ session, stats }: TitularInicioViewProps) {
  const firstName = session.nombreCompleto.trim().split(/\s+/)[0] ?? session.nombreCompleto;

  return (
    <section className={styles.page} aria-labelledby="titular-inicio-title">
      <PageHeader
        titleId="titular-inicio-title"
        eyebrow="Titular de área"
        title={`Hola, ${firstName}`}
        description="Gestiona las vacantes, postulaciones y procesos de servicio social en tu área."
      />

      <div className={inicioStyles.welcomeCard}>
        <p className={inicioStyles.welcomeText}>
          Tienes acceso al panel de <strong>Titular de área</strong>. Desde aquí puedes
          publicar vacantes, atender postulaciones y dar seguimiento a los procesos de los
          alumnos asignados.
        </p>
      </div>

      <div className={styles.summaryRow}>
        <div className={styles.summaryCard}>
          <span className={styles.summaryValue}>{stats.vacantes}</span>
          <span className={styles.summaryLabel}>Vacantes</span>
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.summaryValue}>{stats.postulaciones}</span>
          <span className={styles.summaryLabel}>Postulaciones</span>
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.summaryValue}>{stats.procesos}</span>
          <span className={styles.summaryLabel}>Procesos</span>
        </div>
      </div>

      <div className={inicioStyles.sectionHeader}>
        <h2 className={inicioStyles.sectionTitle}>Accesos rápidos</h2>
      </div>

      <div className={inicioStyles.cardGrid}>
        {QUICK_ACCESS.map((item) => {
          const Icon = item.icon;
          const value = stats[item.statKey];

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
