import Image from "next/image";
import { Button } from "@/shared/components/Button";
import { Briefcase, UserPlus } from "@/shared/icons";
import headerStyles from "../LandingSectionHeader/LandingSectionHeader.module.css";
import sectionStyles from "../../styles/LandingSection.module.css";
import styles from "./LandingHero.module.css";

export function LandingHero() {
  return (
    <section
      id="inicio"
      aria-labelledby="hero-title"
      className={`${sectionStyles.section} ${sectionStyles.surfaceLight} ${styles.hero}`}
    >
      <div className={styles.container}>
        <div className={styles.content}>
          <span className={headerStyles.eyebrow}>
            Gobierno del Estado de México
          </span>

          <h1 id="hero-title" className={styles.title}>
            <span className={styles.titleLine}>Plataforma de Control</span>
            <span className={styles.titleLine}>
              para{" "}
              <span className={styles.titleVino}>Servicio Social</span>,
            </span>
            <span className={styles.titleLine}>
              <span className={styles.titleDorado}>Prácticas</span> y{" "}
              <span className={styles.titleVino}>Residencias Profesionales</span>
            </span>
          </h1>

          <p className={styles.description}>
            Realiza tu{" "}
            <span className={styles.descriptionVino}>servicio social</span>,{" "}
            <span className={styles.descriptionDorado}>prácticas</span> o{" "}
            <span className={styles.descriptionVino}>residencia profesional</span>{" "}
            con información clara sobre{" "}
            <span className={styles.descriptionDorado}>vacantes</span> en
            dependencias del Gobierno del Estado de México y seguimiento durante
            todo el proceso.
          </p>

          <div id="registrarme" className={styles.actions}>
            <Button href="#registrarme" variant="primary">
              <UserPlus className={styles.actionIcon} size={18} strokeWidth={2} />
              Registrarme
            </Button>
            <Button href="#vacantes" variant="outline">
              <Briefcase className={styles.actionIcon} size={18} strokeWidth={2} />
              Ver vacantes
            </Button>
          </div>
        </div>

        <div className={styles.visual} aria-hidden="true">
          <Image
            className={styles.image}
            src="/images/fondoLanding.webp"
            alt=""
            width={800}
            height={800}
            sizes="(min-width: 961px) 50vw, 0px"
            loading="lazy"
            fetchPriority="low"
          />
        </div>
      </div>
    </section>
  );
}
