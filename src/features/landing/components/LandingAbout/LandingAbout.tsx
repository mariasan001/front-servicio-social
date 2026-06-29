import { Briefcase, ClipboardList, Layers } from "@/shared/icons";
import { getLandingAccent } from "../../constants/accents";
import { LandingSectionHeader } from "../LandingSectionHeader/LandingSectionHeader";
import sectionStyles from "../../styles/LandingSection.module.css";
import scrollStyles from "../../styles/LandingScrollRegion.module.css";
import headerStyles from "../LandingSectionHeader/LandingSectionHeader.module.css";
import styles from "./LandingAbout.module.css";

const FEATURES = [
  {
    icon: Briefcase,
    title: "Vacantes disponibles",
    description:
      "Consulta vacantes activas en secretarías y dependencias del Gobierno del Estado de México.",
  },
  {
    icon: ClipboardList,
    title: "Seguimiento claro",
    description:
      "Consulta el avance de tu servicio social o residencia profesional en cada etapa del proceso.",
  },
  {
    icon: Layers,
    title: "Información centralizada",
    description:
      "Encuentra convocatorias, eventos, convenios y preguntas frecuentes en un mismo lugar.",
  },
] as const;

export function LandingAbout() {
  return (
    <section
      id="como-registro"
      className={`${sectionStyles.section} ${sectionStyles.surfaceLight}`}
    >
      <div
        className={`${sectionStyles.container} ${sectionStyles.containerFlushMobile}`}
      >
        <LandingSectionHeader
          align="center"
          className={sectionStyles.headerPad}
          eyebrow="Sobre la plataforma"
          title={
            <>
              Acerca de la{" "}
              <span className={headerStyles.titleAccent}>plataforma</span>
            </>
          }
          intro="Este espacio permite a estudiantes del Estado de México consultar oportunidades en el sector público estatal, conocer el proceso de participación y dar seguimiento a su servicio social o residencia profesional."
        />

        <p
          id="about-scroll-hint"
          className={`${scrollStyles.scrollHint} ${scrollStyles.scrollHintVisible}`}
        >
          Desliza horizontalmente para ver más beneficios
        </p>

        <ul
          className={`${styles.grid} ${scrollStyles.scrollRegion}`}
          aria-label="Beneficios de la plataforma"
          aria-describedby="about-scroll-hint"
          tabIndex={0}
        >
          {FEATURES.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <li
                key={feature.title}
                className={styles.card}
                data-accent={getLandingAccent(index)}
              >
                <span className={styles.step}>
                  {String(index + 1).padStart(2, "0")}
                </span>

                <span className={styles.iconWrap} aria-hidden="true">
                  <Icon className={styles.icon} size={24} strokeWidth={2} />
                </span>

                <h3 className={styles.cardTitle}>{feature.title}</h3>
                <p className={styles.cardDescription}>{feature.description}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
