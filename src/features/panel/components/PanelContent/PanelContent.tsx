import { EmptyState } from "@/shared/components/EmptyState";
import { PageHeader } from "@/shared/components/PageHeader";
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
      <PageHeader
        eyebrow={roleLabel}
        title={title}
        description={description}
        titleId="panel-section-title"
      />

      <EmptyState
        title="Contenido en construcción"
        description="Esta sección estará disponible próximamente. Por ahora puedes navegar entre las opciones del menú lateral."
      />
    </section>
  );
}
