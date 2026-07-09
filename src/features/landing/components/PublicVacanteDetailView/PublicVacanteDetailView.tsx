import Link from "next/link";
import type { ReactNode } from "react";
import { AUTH_PATHS } from "@/lib/auth/constants";
import {
  buildAlumnoPostulacionLoginHref,
  buildAlumnoPostulacionRegisterHref,
} from "@/lib/auth/postulacion-entry";
import { Button } from "@/shared/components/Button";
import {
  ArrowLeft,
  Building2,
  Clock,
  ClipboardList,
  FileCheck,
  LogIn,
  UserPlus,
  Users,
} from "@/shared/icons";
import { PUBLIC_VACANTES_ROUTES } from "../../constants/routes";
import type { PublicVacanteDetalleResponse } from "../../types/public-vacante.types";
import { PublicVacanteSummary } from "../PublicVacanteSummary/PublicVacanteSummary";
import cardStyles from "../LandingVacancies/LandingVacancyPreviewCard.module.css";
import styles from "./PublicVacanteDetailView.module.css";

const LOGIN_POSTULAR_HREF = buildAlumnoPostulacionLoginHref(AUTH_PATHS.login);
const REGISTER_POSTULAR_HREF = buildAlumnoPostulacionRegisterHref(AUTH_PATHS.register);

type PublicVacanteDetailViewProps = {
  vacante: PublicVacanteDetalleResponse;
};

function DetailBlock({
  icon,
  label,
  value,
  fullWidth = false,
}: {
  icon: ReactNode;
  label: string;
  value?: string | null;
  fullWidth?: boolean;
}) {
  if (!value?.trim()) {
    return null;
  }

  return (
    <article
      className={fullWidth ? styles.detailBlockFull : styles.detailBlock}
    >
      <div className={styles.detailHeading}>
        <span className={styles.detailIcon} aria-hidden>
          {icon}
        </span>
        <h2 className={styles.detailLabel}>{label}</h2>
      </div>
      <p className={styles.detailValue}>{value.trim()}</p>
    </article>
  );
}

function formatHorario(vacante: PublicVacanteDetalleResponse) {
  const horario = vacante.horario?.trim();
  if (horario) {
    return horario;
  }

  const tipoHorario = vacante.tipoHorario?.trim();
  const dias = vacante.diasDisponibles?.trim();

  if (tipoHorario && dias) {
    return `${tipoHorario} · ${dias}`;
  }

  return tipoHorario ?? dias ?? null;
}

export function PublicVacanteDetailView({ vacante }: PublicVacanteDetailViewProps) {
  const horario = formatHorario(vacante);

  const detailBlocks = [
    {
      icon: <ClipboardList size={16} strokeWidth={2} />,
      label: "Descripción",
      value: vacante.descripcion,
      fullWidth: true,
    },
    {
      icon: <Users size={16} strokeWidth={2} />,
      label: "Perfil requerido",
      value: vacante.perfilRequerido,
    },
    {
      icon: <FileCheck size={16} strokeWidth={2} />,
      label: "Nivel educativo",
      value: vacante.nivelEducativo,
    },
    {
      icon: <Building2 size={16} strokeWidth={2} />,
      label: "Dirección",
      value: vacante.direccion,
    },
    {
      icon: <Clock size={16} strokeWidth={2} />,
      label: "Horario",
      value: horario,
    },
  ];

  const hasDetailContent = detailBlocks.some((block) => block.value?.trim());

  return (
    <section className={styles.section}>
      <div className={styles.page}>
        <article className={`${cardStyles.card} ${styles.shell}`} data-accent="vino">
          <div className={styles.shellBody}>
            <Link href={PUBLIC_VACANTES_ROUTES.directory} className={styles.backLink}>
              <ArrowLeft size={16} strokeWidth={2} />
              Volver al directorio
            </Link>

            <PublicVacanteSummary
              vacante={vacante}
              titleTag="h1"
              showExtended
              variant="detail"
            />

            {hasDetailContent ? (
              <div className={styles.detailSection}>
                <h2 className={styles.sectionTitle}>Información de la vacante</h2>
                <div className={styles.detailGrid}>
                  {detailBlocks.map((block) => (
                    <DetailBlock
                      key={block.label}
                      icon={block.icon}
                      label={block.label}
                      value={block.value}
                      fullWidth={block.fullWidth}
                    />
                  ))}
                </div>
              </div>
            ) : null}

            <div className={styles.actions}>
              <Button href={LOGIN_POSTULAR_HREF} variant="primary" className={styles.postularBtn}>
                <LogIn size={18} strokeWidth={2} />
                Iniciar sesión para postularme
              </Button>
              <Button
                href={REGISTER_POSTULAR_HREF}
                variant="outline"
                className={styles.postularBtn}
              >
                <UserPlus size={18} strokeWidth={2} />
                Crear cuenta
              </Button>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
