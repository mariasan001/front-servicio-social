import Link from "next/link";
import { ArrowRight } from "@/shared/icons";
import { getLandingAccent } from "../../constants/accents";
import type { PublicVacanteResponse } from "../../types/public-vacante.types";
import { PublicVacanteSummary } from "../PublicVacanteSummary/PublicVacanteSummary";
import styles from "./LandingVacancyPreviewCard.module.css";

type LandingVacancyPreviewCardProps = {
  vacante: PublicVacanteResponse;
  href: string;
  index?: number;
};

export function LandingVacancyPreviewCard({
  vacante,
  href,
  index = 0,
}: LandingVacancyPreviewCardProps) {
  const accent = getLandingAccent(index);

  return (
    <article className={styles.card} data-accent={accent}>
      <Link href={href} className={styles.cardLink}>
        <PublicVacanteSummary vacante={vacante} variant="card" />
        <span className={styles.cta}>
          Ver detalle
          <ArrowRight className={styles.ctaIcon} size={16} strokeWidth={2} />
        </span>
      </Link>
    </article>
  );
}
