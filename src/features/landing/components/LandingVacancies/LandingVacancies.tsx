import { Button } from "@/shared/components/Button";
import { ArrowRight, Briefcase, Clock, MapPin, UserRound, Users } from "@/shared/icons";
import {
  FEATURED_VACANCIES,
  VACANCY_MODALITY_LABELS,
  VACANCY_TYPE_LABELS,
  type VacancyCategory,
} from "../../constants/vacancies";
import { LandingSectionHeader } from "../LandingSectionHeader/LandingSectionHeader";
import cardStyles from "../../styles/LandingCard.module.css";
import sectionStyles from "../../styles/LandingSection.module.css";
import scrollStyles from "../../styles/LandingScrollRegion.module.css";
import headerStyles from "../LandingSectionHeader/LandingSectionHeader.module.css";
import styles from "./LandingVacancies.module.css";

const DISPLAYED_VACANCIES = FEATURED_VACANCIES.slice(0, 3);

const ACCENT_BY_TYPE: Record<VacancyCategory, string> = {
  "servicio-social": "vino",
  residencias: "dorado",
  practicas: "vino-dark",
};

export function LandingVacancies() {
  return (
    <section
      id="vacantes"
      className={`${sectionStyles.section} ${sectionStyles.surfaceLight}`}
    >
      <div
        className={`${sectionStyles.container} ${sectionStyles.containerFlushMobile} ${styles.vacanciesSection}`}
      >
        <div className={styles.introBlock}>
          <LandingSectionHeader
            className={`${sectionStyles.headerPad} ${styles.vacanciesHeader}`}
            copyClassName={styles.vacanciesCopy}
            title={
              <>
                Vacantes que podrían{" "}
                <span className={headerStyles.titleAccent}>interesarte</span>
              </>
            }
            intro="Explora oportunidades en dependencias del Gobierno del Estado de México. Consulta el detalle de cada vacante y postúlate cuando encuentres la opción ideal para ti."
            actionClassName={styles.vacanciesAction}
            action={
              <Button href="#vacantes-todas" variant="outline" className={styles.viewAll}>
                Ver todas las vacantes
                <ArrowRight className={styles.viewAllIcon} size={18} strokeWidth={2} />
              </Button>
            }
          />

          <p
            id="vacancies-scroll-hint"
            className={`${scrollStyles.scrollHint} ${scrollStyles.scrollHintVisible} ${styles.scrollHint}`}
          >
            Desliza horizontalmente para ver más vacantes
          </p>
        </div>

        <ul
          className={`${styles.grid} ${scrollStyles.scrollRegion}`}
          aria-label="Vacantes destacadas"
          aria-describedby="vacancies-scroll-hint"
          tabIndex={0}
        >
          {DISPLAYED_VACANCIES.map((vacancy) => (
            <li
              key={vacancy.id}
              className={`${cardStyles.shell} ${styles.vacancyCard}`}
              data-accent={ACCENT_BY_TYPE[vacancy.tipo]}
            >
              <div className={`${cardStyles.header} ${styles.vacancyHeader}`}>
                <div className={styles.headerTop}>
                  <span className={cardStyles.badge}>
                    {VACANCY_TYPE_LABELS[vacancy.tipo]}
                  </span>
                </div>

                <div className={cardStyles.titleRow}>
                  <span className={cardStyles.iconWrap} aria-hidden>
                    <Briefcase size={18} strokeWidth={2} />
                  </span>
                  <div className={styles.titleBlock}>
                    <h3 className={cardStyles.title}>{vacancy.lugar}</h3>
                    <p
                      className={styles.slots}
                      aria-label={`${vacancy.lugaresDisponibles} lugares disponibles`}
                    >
                      <UserRound size={13} strokeWidth={2} />
                      <span>
                        <strong>{vacancy.lugaresDisponibles}</strong> lugares
                        disponibles
                      </span>
                    </p>
                  </div>
                </div>

                <div className={styles.headerMeta}>
                  <span className={styles.modalityBadge}>
                    {VACANCY_MODALITY_LABELS[vacancy.modalidad]}
                  </span>
                  <span className={styles.location}>
                    <MapPin size={13} strokeWidth={2} />
                    {vacancy.ubicacion}
                  </span>
                </div>
              </div>

              <div className={styles.cardBody}>
                <blockquote className={`${cardStyles.description} ${cardStyles.quote}`}>
                  {vacancy.descripcion}
                </blockquote>

                <div className={styles.metaGrid}>
                  <div className={styles.metaChip}>
                    <span className={styles.metaChipIcon}>
                      <Users size={14} strokeWidth={2} />
                    </span>
                    <span className={styles.metaChipContent}>
                      <span className={styles.metaLabel}>Perfil</span>
                      <span className={styles.metaValue}>{vacancy.perfil}</span>
                    </span>
                  </div>

                  <div className={styles.metaChip}>
                    <span className={styles.metaChipIcon}>
                      <Clock size={14} strokeWidth={2} />
                    </span>
                    <span className={styles.metaChipContent}>
                      <span className={styles.metaLabel}>Horario</span>
                      <span className={styles.metaValue}>{vacancy.horario}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className={styles.cardFooter}>
                <Button
                  href={`#vacante-${vacancy.id}`}
                  variant="primary"
                  className={styles.cardAction}
                >
                  Ver vacante
                  <ArrowRight
                    className={styles.cardActionIcon}
                    size={16}
                    strokeWidth={2}
                  />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
