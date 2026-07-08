import {
  Building2,
  Briefcase,
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
import styles from "./PublicVacanteSummary.module.css";

type PublicVacanteSummaryProps = {
  vacante: PublicVacanteResponse;
  titleTag?: "h1" | "h3";
  showExtended?: boolean;
  variant?: "card" | "detail";
};

export function PublicVacanteSummary({
  vacante,
  titleTag = "h3",
  showExtended = false,
  variant = "card",
}: PublicVacanteSummaryProps) {
  const nombre = vacante.nombre?.trim();
  const dependencia = vacante.dependenciaNombre?.trim();
  const area = vacante.areaNombre?.trim();
  const modalidad = vacante.modalidadId
    ? getModalidadCatalogoLabel(vacante.modalidadId)
    : null;
  const modalidadTrabajo = vacante.modalidadTrabajo
    ? getModalidadTrabajoLabel(vacante.modalidadTrabajo)
    : null;
  const fecha = formatPublicVacanteDate(vacante.fechaPublicacion);
  const cupo =
    vacante.cupoDisponible !== undefined
      ? vacante.cupoTotal !== undefined
        ? `${vacante.cupoDisponible}/${vacante.cupoTotal}`
        : String(vacante.cupoDisponible)
      : null;

  const TitleTag = titleTag;
  const titleClassName =
    titleTag === "h1" ? styles.titlePage : styles.titleCard;

  return (
    <div className={styles.summary}>
      <div className={styles.top}>
        {modalidad ? (
          <span className={styles.badge}>
            <Briefcase size={12} strokeWidth={2.25} aria-hidden />
            {modalidad}
          </span>
        ) : (
          <span />
        )}
        {cupo ? (
          <span className={styles.cupoPill}>
            <UserRound size={13} strokeWidth={2} aria-hidden />
            {cupo} lugares
          </span>
        ) : null}
      </div>

      {nombre ? <TitleTag className={titleClassName}>{nombre}</TitleTag> : null}

      {dependencia ? (
        <p className={styles.dependencia}>
          <Building2 size={15} strokeWidth={2} aria-hidden />
          <span>{dependencia}</span>
        </p>
      ) : null}

      <div
        className={
          variant === "detail"
            ? styles.statsDetail
            : variant === "card"
              ? styles.statsCard
              : styles.stats
        }
      >
        {modalidadTrabajo ? (
          <span className={styles.stat}>
            <MapPin size={14} strokeWidth={2} aria-hidden />
            {modalidadTrabajo}
          </span>
        ) : null}
        {fecha ? (
          <span className={styles.stat}>
            <Clock size={14} strokeWidth={2} aria-hidden />
            {fecha}
          </span>
        ) : null}
        {showExtended && area ? (
          <span className={styles.stat}>
            <Layers size={14} strokeWidth={2} aria-hidden />
            {area}
          </span>
        ) : null}
        {showExtended && vacante.requiereExamen !== undefined ? (
          <span className={styles.stat}>
            <FileCheck size={14} strokeWidth={2} aria-hidden />
            {vacante.requiereExamen ? "Requiere examen" : "Sin examen"}
          </span>
        ) : null}
      </div>
    </div>
  );
}
