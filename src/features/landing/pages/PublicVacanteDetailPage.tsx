import { notFound } from "next/navigation";
import { LandingFooter } from "../components/LandingFooter/LandingFooter";
import { LandingHeader } from "../components/LandingHeader/LandingHeader";
import { LandingPublicLoadAlert } from "../components/LandingPublicLoadAlert/LandingPublicLoadAlert";
import { PublicVacanteDetailView } from "../components/PublicVacanteDetailView/PublicVacanteDetailView";
import { PUBLIC_LOAD_ERRORS } from "../lib/public-data";
import { isPublishedVacante } from "../lib/public-vacantes";
import { getPublicVacanteDetail } from "../services/public-vacantes.service";
import styles from "./PublicVacantesPages.module.css";

type PublicVacanteDetailPageProps = {
  idVacante: number;
};

export async function PublicVacanteDetailPage({
  idVacante,
}: PublicVacanteDetailPageProps) {
  const result = await getPublicVacanteDetail(idVacante);

  if (!result.ok) {
    if (result.reason === "not_found") {
      notFound();
    }

    return (
      <div className={styles.page}>
        <LandingHeader />
        <main id="main" className={styles.main}>
          <div className={styles.stateWrap}>
            <LandingPublicLoadAlert message={PUBLIC_LOAD_ERRORS.vacanteDetalle} />
          </div>
        </main>
        <LandingFooter />
      </div>
    );
  }

  if (!isPublishedVacante(result.data)) {
    notFound();
  }

  return (
    <div className={styles.page}>
      <LandingHeader />
      <main id="main" className={styles.main}>
        <PublicVacanteDetailView vacante={result.data} />
      </main>
      <LandingFooter />
    </div>
  );
}
