import Link from "next/link";
import {
  Building2,
  Layers,
  School,
  Users,
  type LucideIcon,
} from "lucide-react";
import { PANEL_PATHS } from "@/lib/auth/constants";
import type { AuthUser } from "@/lib/api/types";
import { PageHeader } from "@/shared/components/PageHeader";
import styles from "./AdminInicioView.module.css";

type AdminInicioStats = {
  dependencias: { total: number; activas: number };
  areas: { total: number; activas: number };
  escuelas: { total: number; activas: number };
  usuarios: { total: number; activos: number };
};

type AdminInicioViewProps = {
  session: AuthUser;
  stats: AdminInicioStats;
};

type QuickAccessItem = {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
  total: number;
  activeLabel: string;
  activeCount: number;
};

export function AdminInicioView({ session, stats }: AdminInicioViewProps) {
  const firstName = session.nombreCompleto.trim().split(/\s+/)[0] ?? session.nombreCompleto;

  const quickAccess: QuickAccessItem[] = [
    {
      href: `${PANEL_PATHS.admin}/dependencias`,
      label: "Dependencias",
      description: "Consulta las dependencias receptoras del programa.",
      icon: Building2,
      total: stats.dependencias.total,
      activeLabel: "activas",
      activeCount: stats.dependencias.activas,
    },
    {
      href: `${PANEL_PATHS.admin}/areas`,
      label: "Áreas",
      description: "Revisa las áreas y sus titulares asignados.",
      icon: Layers,
      total: stats.areas.total,
      activeLabel: "activas",
      activeCount: stats.areas.activas,
    },
    {
      href: `${PANEL_PATHS.admin}/escuelas`,
      label: "Escuelas",
      description: "Administra las instituciones educativas participantes.",
      icon: School,
      total: stats.escuelas.total,
      activeLabel: "activas",
      activeCount: stats.escuelas.activas,
    },
    {
      href: `${PANEL_PATHS.admin}/usuarios`,
      label: "Usuarios internos",
      description: "Consulta las cuentas del personal del programa.",
      icon: Users,
      total: stats.usuarios.total,
      activeLabel: "activas",
      activeCount: stats.usuarios.activos,
    },
  ];

  return (
    <section className={styles.page} aria-labelledby="admin-inicio-title">
      <PageHeader
        titleId="admin-inicio-title"
        eyebrow="Administración"
        title={`Hola, ${firstName}`}
        description="Este es tu punto de partida para consultar la información base del programa de servicio social y residencia."
      />

      <div className={styles.welcomeCard}>
        <p className={styles.welcomeText}>
          Tienes acceso al panel de <strong>Administración</strong>. Desde aquí puedes
          revisar dependencias, áreas, escuelas y cuentas del personal de forma rápida y
          sencilla.
        </p>
        <p className={styles.welcomeMeta}>
          Sesión iniciada como <strong>{session.nombreCompleto}</strong>
        </p>
      </div>

      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Accesos rápidos</h2>
        <p className={styles.sectionDescription}>
          Selecciona una sección para ver el detalle y realizar consultas.
        </p>
      </div>

      <div className={styles.cardGrid}>
        {quickAccess.map((item) => {
          const Icon = item.icon;

          return (
            <Link key={item.href} href={item.href} className={styles.accessCard}>
              <span className={styles.accessIcon} aria-hidden="true">
                <Icon size={22} strokeWidth={2} />
              </span>

              <div className={styles.accessContent}>
                <h3 className={styles.accessTitle}>{item.label}</h3>
                <p className={styles.accessDescription}>{item.description}</p>
              </div>

              <div className={styles.accessStats}>
                <span className={styles.accessTotal}>{item.total}</span>
                <span className={styles.accessMeta}>
                  registradas · {item.activeCount} {item.activeLabel}
                </span>
              </div>

              <span className={styles.accessCta}>Entrar</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
