import type { ReactNode } from "react";
import Link from "next/link";
import {
  Building2,
  Briefcase,
  ClipboardList,
  Clock,
  FileCheck,
  Layers,
  MapPin,
  UserRound,
} from "@/shared/icons";
import { getModalidadCatalogoLabel } from "@/lib/domain/modalidad";
import { getModalidadTrabajoLabel } from "@/lib/domain/vacante";
import { formatPublicVacanteDate } from "../../lib/public-vacantes";
import type { PublicVacanteResponse } from "../../types/public-vacante.types";
import styles from "./PublicVacanteFields.module.css";

type MetaItem = {
  icon: ReactNode;
  value: string;
  label: string;
};

type PublicVacanteMetaProps = {
  vacante: PublicVacanteResponse;
  variant?: "compact" | "full";
};

function buildMetaItems(
  vacante: PublicVacanteResponse,
  variant: "compact" | "full",
): MetaItem[] {
  const items: MetaItem[] = [];

  const dependencia = vacante.dependenciaNombre?.trim();
  if (dependencia) {
    items.push({
      icon: <Building2 size={14} strokeWidth={2} />,
      value: dependencia,
      label: "Dependencia",
    });
  }

  if (variant === "full") {
    const area = vacante.areaNombre?.trim();
    if (area) {
      items.push({
        icon: <Layers size={14} strokeWidth={2} />,
        value: area,
        label: "Área",
      });
    }
  }

  if (vacante.modalidadId) {
    const modalidad = getModalidadCatalogoLabel(vacante.modalidadId);
    if (modalidad) {
      items.push({
        icon: <ClipboardList size={14} strokeWidth={2} />,
        value: modalidad,
        label: "Modalidad",
      });
    }
  }

  if (vacante.modalidadTrabajo) {
    const modalidadTrabajo = getModalidadTrabajoLabel(vacante.modalidadTrabajo);
    if (modalidadTrabajo) {
      items.push({
        icon: <MapPin size={14} strokeWidth={2} />,
        value: modalidadTrabajo,
        label: "Modalidad de trabajo",
      });
    }
  }

  if (vacante.cupoDisponible !== undefined) {
    const cupo =
      vacante.cupoTotal !== undefined
        ? `${vacante.cupoDisponible} de ${vacante.cupoTotal} lugares`
        : `${vacante.cupoDisponible} lugares`;
    items.push({
      icon: <UserRound size={14} strokeWidth={2} />,
      value: cupo,
      label: "Cupo disponible",
    });
  }

  if (variant === "full" && vacante.requiereExamen !== undefined) {
    items.push({
      icon: <FileCheck size={14} strokeWidth={2} />,
      value: vacante.requiereExamen ? "Requiere examen" : "Sin examen",
      label: "Examen",
    });
  }

  const fecha = formatPublicVacanteDate(vacante.fechaPublicacion);
  if (fecha) {
    items.push({
      icon: <Clock size={14} strokeWidth={2} />,
      value: fecha,
      label: "Publicada",
    });
  }

  return items;
}

export function PublicVacanteMeta({
  vacante,
  variant = "compact",
}: PublicVacanteMetaProps) {
  const items = buildMetaItems(vacante, variant);

  if (items.length === 0) {
    return null;
  }

  return (
    <ul className={variant === "full" ? styles.metaGrid : styles.metaList}>
      {items.map((item) => (
        <li key={`${item.label}-${item.value}`} className={styles.chip} title={item.label}>
          <span className={styles.chipIcon} aria-hidden>
            {item.icon}
          </span>
          <span className={styles.chipValue}>{item.value}</span>
        </li>
      ))}
    </ul>
  );
}

/** @deprecated Use PublicVacanteMeta */
export function PublicVacanteFields({
  vacante,
  compact = false,
}: {
  vacante: PublicVacanteResponse;
  compact?: boolean;
}) {
  return <PublicVacanteMeta vacante={vacante} variant={compact ? "compact" : "full"} />;
}

export function PublicVacanteTitle({
  vacante,
  href,
  inverted = false,
}: {
  vacante: PublicVacanteResponse;
  href?: string;
  inverted?: boolean;
}) {
  const nombre = vacante.nombre?.trim();
  if (!nombre) {
    return null;
  }

  const className = inverted ? styles.titleInverted : styles.title;

  if (href) {
    return (
      <Link href={href} className={className}>
        {nombre}
      </Link>
    );
  }

  return <span className={className}>{nombre}</span>;
}

export function PublicVacanteBadge({
  vacante,
  inverted = false,
}: {
  vacante: PublicVacanteResponse;
  inverted?: boolean;
}) {
  if (!vacante.modalidadId) {
    return null;
  }

  const label = getModalidadCatalogoLabel(vacante.modalidadId);
  if (!label) {
    return null;
  }

  return (
    <span
      className={inverted ? styles.programBadgeInverted : styles.programBadge}
    >
      <Briefcase size={12} strokeWidth={2} aria-hidden />
      {label}
    </span>
  );
}
