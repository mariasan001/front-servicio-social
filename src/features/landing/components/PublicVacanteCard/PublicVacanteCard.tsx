import Link from "next/link";
import { ArrowRight, Briefcase } from "@/shared/icons";
import { getLandingAccent } from "../../constants/accents";
import type { PublicVacanteResponse } from "../../types/public-vacante.types";
import { PublicVacanteMeta } from "../PublicVacanteFields/PublicVacanteFields";
import cardStyles from "../../styles/LandingCard.module.css";
import styles from "./PublicVacanteCard.module.css";

type PublicVacanteCardProps = {
  vacante: PublicVacanteResponse;
  href: string;
  index?: number;
};

export function PublicVacanteCard({ vacante, href, index = 0 }: PublicVacanteCardProps) {
  const accent = getLandingAccent(index);
  const nombre = vacante.nombre?.trim();

  return (
    <article className={`${cardStyles.shell} ${styles.card}`} data-accent={accent}>
      <Link href={href} className={styles.cardLink}>
        <div className={`${cardStyles.header} ${styles.header}`}>
          <div className={cardStyles.titleRow}>
            <span className={cardStyles.iconWrap} aria-hidden>
              <Briefcase size={18} strokeWidth={2} />
            </span>
            <div className={styles.titleBlock}>
              {nombre ? <h3 className={cardStyles.title}>{nombre}</h3> : null}
            </div>
          </div>
        </div>

        <div className={styles.body}>
          <PublicVacanteMeta vacante={vacante} variant="compact" />
        </div>

        <div className={styles.footer}>
          <span className={styles.cta}>
            Ver detalle
            <ArrowRight className={styles.ctaIcon} size={16} strokeWidth={2} />
          </span>
        </div>
      </Link>
    </article>
  );
}
