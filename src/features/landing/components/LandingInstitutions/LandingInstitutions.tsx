import { Building2, Briefcase, ClipboardList, Users } from "@/shared/icons";
import { getLandingAccent } from "../../constants/accents";
import type { PublicEscuelaEstadisticasResponse } from "../../types/public-escuela.types";
import { LandingSectionHeader } from "../LandingSectionHeader/LandingSectionHeader";
import sectionStyles from "../../styles/LandingSection.module.css";
import scrollStyles from "../../styles/LandingScrollRegion.module.css";
import headerStyles from "../LandingSectionHeader/LandingSectionHeader.module.css";
import styles from "./LandingInstitutions.module.css";

type LandingInstitutionsProps = {
  escuelas: PublicEscuelaEstadisticasResponse[];
};

export function LandingInstitutions({ escuelas }: LandingInstitutionsProps) {
  const hasEscuelas = escuelas.length > 0;

  return (
    <section
      id="instituciones"
      className={`${sectionStyles.section} ${sectionStyles.surfaceLight}`}
    >
      <div
        className={`${sectionStyles.container} ${sectionStyles.containerFlushMobile}`}
      >
        <LandingSectionHeader
          align="center"
          className={sectionStyles.headerPad}
          title={
            <>
              Instituciones registradas en la{" "}
              <span className={headerStyles.titleAccent}>plataforma</span>
            </>
          }
          intro="Universidades e instituciones educativas del Estado de México que participan en la plataforma y concentran a estudiantes en servicio social, prácticas y residencias profesionales."
        />

        {hasEscuelas ? (
          <p
            id="institutions-scroll-hint"
            className={`${scrollStyles.scrollHint} ${scrollStyles.scrollHintAlways}`}
          >
            Desliza horizontalmente para ver más instituciones
          </p>
        ) : null}

        {!hasEscuelas ? (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon} aria-hidden>
              <Building2 size={28} strokeWidth={1.75} />
            </span>
            <p>No hay estadísticas de instituciones disponibles en este momento.</p>
          </div>
        ) : (
          <ul
            className={`${styles.grid} ${scrollStyles.scrollRegion}`}
            aria-label="Instituciones registradas"
            aria-describedby="institutions-scroll-hint"
            tabIndex={0}
          >
            {escuelas.map((escuela, index) => {
              const accent = getLandingAccent(index);

              return (
                <li
                  key={escuela.idEscuela}
                  className={styles.card}
                  data-accent={accent}
                >
                  <div className={styles.cardHead}>
                    <span className={styles.iconWrap} aria-hidden="true">
                      <Building2 size={20} strokeWidth={2} />
                    </span>
                    <h3 className={styles.cardTitle}>{escuela.nombreOficial}</h3>
                  </div>

                  <dl className={styles.stats}>
                    <div className={styles.stat}>
                      <dt className={styles.statLabel}>
                        <Users size={14} strokeWidth={2} />
                        Participantes
                      </dt>
                      <dd className={styles.statValue}>
                        {escuela.totalParticipantes}
                      </dd>
                    </div>

                    <div className={styles.stat}>
                      <dt className={styles.statLabel}>
                        <Briefcase size={14} strokeWidth={2} />
                        Prácticas y residencias
                      </dt>
                      <dd className={styles.statValue}>
                        {escuela.practicasResidencias}
                      </dd>
                    </div>

                    <div className={styles.stat}>
                      <dt className={styles.statLabel}>
                        <ClipboardList size={14} strokeWidth={2} />
                        Servicio social
                      </dt>
                      <dd className={styles.statValue}>
                        {escuela.servicioSocial}
                      </dd>
                    </div>
                  </dl>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
