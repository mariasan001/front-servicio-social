import styles from "./SkipLink.module.css";

export function SkipLink() {
  return (
    <a href="#main" className={styles.skipLink}>
      Saltar al contenido principal
    </a>
  );
}
