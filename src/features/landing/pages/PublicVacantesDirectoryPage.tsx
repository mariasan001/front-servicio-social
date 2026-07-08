import { LandingFooter } from "../components/LandingFooter/LandingFooter";
import { LandingHeader } from "../components/LandingHeader/LandingHeader";
import { PublicVacantesDirectory } from "../components/PublicVacantesDirectory/PublicVacantesDirectory";
import { listPublishedPublicVacantes } from "../lib/public-vacantes";
import styles from "./PublicVacantesPages.module.css";

export async function PublicVacantesDirectoryPage() {
  const { data: vacantes, loadError } = await listPublishedPublicVacantes();

  return (
    <div className={styles.page}>
      <LandingHeader />
      <main id="main" className={styles.main}>
        <PublicVacantesDirectory vacantes={vacantes} loadError={loadError} />
      </main>
      <LandingFooter />
    </div>
  );
}
