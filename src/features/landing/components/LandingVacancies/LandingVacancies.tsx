import { Button } from "@/shared/components/Button";
import { ArrowRight, Briefcase } from "@/shared/icons";
import { PUBLIC_VACANTES_ROUTES } from "../../constants/routes";
import type { PublicVacanteResponse } from "../../types/public-vacante.types";
import { LandingPublicLoadAlert } from "../LandingPublicLoadAlert/LandingPublicLoadAlert";
import { LandingVacancyPreviewCard } from "./LandingVacancyPreviewCard";
import { LandingSectionHeader } from "../LandingSectionHeader/LandingSectionHeader";
import sectionStyles from "../../styles/LandingSection.module.css";
import scrollStyles from "../../styles/LandingScrollRegion.module.css";
import headerStyles from "../LandingSectionHeader/LandingSectionHeader.module.css";
import styles from "./LandingVacancies.module.css";

type LandingVacanciesProps = {
  vacantes: PublicVacanteResponse[];
  loadError?: string;
};

export function LandingVacancies({ vacantes, loadError }: LandingVacanciesProps) {
  const hasVacantes = vacantes.length > 0;

  return (
    <section
      id="vacantes"
      className={`${sectionStyles.section} ${sectionStyles.surfaceLight}`}
    >
      <div
        className={`${sectionStyles.container} ${sectionStyles.containerFlushMobile}`}
      >
        <div className={styles.introBlock}>
          <LandingSectionHeader
            className={`${sectionStyles.headerPad} ${styles.vacanciesHeader}`}
            copyClassName={styles.vacanciesCopy}
            eyebrow="Oportunidades"
            title={
              <>
                Vacantes que podrían{" "}
                <span className={headerStyles.titleAccent}>interesarte</span>
              </>
            }
            intro="Explora vacantes publicadas con cupo disponible en dependencias del Gobierno del Estado de México."
            actionClassName={styles.vacanciesAction}
            action={
              <Button
                href={PUBLIC_VACANTES_ROUTES.directory}
                variant="primary"
                className={styles.viewAll}
              >
                Ver directorio completo
                <ArrowRight className={styles.viewAllIcon} size={18} strokeWidth={2} />
              </Button>
            }
          />

          {hasVacantes ? (
            <p
              id="vacancies-scroll-hint"
              className={`${scrollStyles.scrollHint} ${scrollStyles.scrollHintVisible} ${styles.scrollHint}`}
            >
              Desliza horizontalmente para ver más vacantes
            </p>
          ) : null}
        </div>

        {loadError ? (
          <LandingPublicLoadAlert message={loadError} />
        ) : !hasVacantes ? (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon} aria-hidden>
              <Briefcase size={28} strokeWidth={1.75} />
            </span>
            <p>No hay vacantes publicadas en este momento.</p>
            <Button href={PUBLIC_VACANTES_ROUTES.directory} variant="outline">
              Ir al directorio
            </Button>
          </div>
        ) : (
          <ul
            className={`${styles.grid} ${scrollStyles.scrollRegion}`}
            aria-label="Vacantes destacadas"
            aria-describedby={hasVacantes ? "vacancies-scroll-hint" : undefined}
            tabIndex={0}
          >
            {vacantes.map((vacante, index) => (
              <li key={vacante.idVacante} className={styles.gridItem}>
                <LandingVacancyPreviewCard
                  vacante={vacante}
                  index={index}
                  href={PUBLIC_VACANTES_ROUTES.detail(vacante.idVacante)}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
