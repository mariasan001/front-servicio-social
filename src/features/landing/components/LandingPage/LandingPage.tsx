import { LandingHeader } from "../LandingHeader/LandingHeader";
import styles from "./LandingPage.module.css";

export function LandingPage() {
  return (
    <div className={styles.page}>
      <LandingHeader />
      <div id="inicio" className={styles.scrollAnchor} aria-hidden="true" />
    </div>
  );
}
