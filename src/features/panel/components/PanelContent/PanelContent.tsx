import styles from "./PanelContent.module.css";

type PanelContentProps = {
  roleLabel: string;
  title: string;
  description?: string;
};

export function PanelContent({
  roleLabel,
  title,
  description,
}: PanelContentProps) {
  return (
    <section className={styles.panelContent} aria-labelledby="panel-section-title">
      <header className={styles.header}>
        <span className={styles.eyebrow}>{roleLabel}</span>
        <h1 id="panel-section-title" className={styles.title}>
          {title}
        </h1>
        {description ? (
          <p className={styles.description}>{description}</p>
        ) : null}
      </header>

      <div className={styles.placeholder} aria-hidden="true">
        <p className={styles.placeholderTitle}>Contenido en construcción</p>
        <p className={styles.placeholderText}>
          Esta sección estará disponible próximamente. Por ahora puedes
          navegar entre las opciones del menú lateral.
        </p>
      </div>
    </section>
  );
}
