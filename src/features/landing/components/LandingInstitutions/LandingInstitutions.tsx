import { Building2, Briefcase, ClipboardList, Users } from "@/shared/icons";
import { getLandingAccent } from "../../constants/accents";
import { REGISTERED_INSTITUTIONS } from "../../constants/institutions";
import { LandingSectionHeader } from "../LandingSectionHeader/LandingSectionHeader";
import sectionStyles from "../../styles/LandingSection.module.css";
import scrollStyles from "../../styles/LandingScrollRegion.module.css";
import headerStyles from "../LandingSectionHeader/LandingSectionHeader.module.css";
import styles from "./LandingInstitutions.module.css";

export function LandingInstitutions() {
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

        <p
          id="institutions-scroll-hint"
          className={`${scrollStyles.scrollHint} ${scrollStyles.scrollHintAlways}`}
        >
          Desliza horizontalmente para ver más instituciones
        </p>

        <ul
          className={`${styles.grid} ${scrollStyles.scrollRegion}`}
          aria-label="Instituciones registradas"
          aria-describedby="institutions-scroll-hint"
          tabIndex={0}
        >
          {REGISTERED_INSTITUTIONS.map((institution, index) => {
            const accent = getLandingAccent(index);

            return (
              <li
                key={institution.id}
                className={styles.card}
                data-accent={accent}
              >
                <div className={styles.cardHead}>
                  <span className={styles.iconWrap} aria-hidden="true">
                    <Building2 size={20} strokeWidth={2} />
                  </span>
                  <h3 className={styles.cardTitle}>{institution.name}</h3>
                </div>

                <dl className={styles.stats}>
                  <div className={styles.stat}>
                    <dt className={styles.statLabel}>
                      <Users size={14} strokeWidth={2} />
                      Participantes
                    </dt>
                    <dd className={styles.statValue}>
                      {institution.participants}
                    </dd>
                  </div>

                  <div className={styles.stat}>
                    <dt className={styles.statLabel}>
                      <Briefcase size={14} strokeWidth={2} />
                      Prácticas y residencias
                    </dt>
                    <dd className={styles.statValue}>
                      {institution.practicasResidencias}
                    </dd>
                  </div>

                  <div className={styles.stat}>
                    <dt className={styles.statLabel}>
                      <ClipboardList size={14} strokeWidth={2} />
                      Servicio social
                    </dt>
                    <dd className={styles.statValue}>
                      {institution.servicioSocial}
                    </dd>
                  </div>
                </dl>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
