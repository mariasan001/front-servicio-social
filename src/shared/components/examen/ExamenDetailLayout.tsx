import type { ReactNode } from "react";
import { FileQuestion } from "lucide-react";
import {
  formatPreguntaTipo,
  type ExamenDiagnosticoDetalleResponse,
  type ExamenPreguntaResponse,
} from "@/lib/domain";
import { EstatusBadge } from "@/shared/components/StatusBadge";
import {
  ExamenBuilder,
  ExamenBuilderEmptyItem,
  ExamenBuilderItem,
  ExamenBuilderMain,
  ExamenBuilderPanelTitle,
  ExamenBuilderSettingsButton,
  ExamenBuilderSidebar,
} from "./ExamenBuilder";
import styles from "./Examen.module.css";

export type ExamenDetailSelection =
  | { type: "settings" }
  | { type: "pregunta"; id: number };

type ExamenDetailLayoutProps = {
  detail: ExamenDiagnosticoDetalleResponse;
  preguntas: ExamenPreguntaResponse[];
  selected: ExamenDetailSelection | null;
  onSelectSettings: () => void;
  onSelectPregunta: (idPregunta: number) => void;
  sidebarAction?: ReactNode;
  sidebarExtraItems?: ReactNode;
  emptyQuestionsLabel?: string;
  isPreguntaWarn?: (pregunta: ExamenPreguntaResponse) => boolean;
  children: ReactNode;
  footer?: ReactNode;
};

export function ExamenDetailLayout({
  detail,
  preguntas,
  selected,
  onSelectSettings,
  onSelectPregunta,
  sidebarAction,
  sidebarExtraItems,
  emptyQuestionsLabel = "Sin preguntas activas.",
  isPreguntaWarn,
  children,
  footer,
}: ExamenDetailLayoutProps) {
  return (
    <ExamenBuilder>
      <ExamenBuilderSidebar
        title={`Preguntas (${preguntas.length})`}
        action={sidebarAction}
        footer={
          <ExamenBuilderSettingsButton
            active={selected?.type === "settings"}
            onClick={onSelectSettings}
          />
        }
      >
        {preguntas.length === 0 && !sidebarExtraItems ? (
          <ExamenBuilderEmptyItem>{emptyQuestionsLabel}</ExamenBuilderEmptyItem>
        ) : null}

        {sidebarExtraItems}

        {preguntas.map((pregunta, index) => (
          <ExamenBuilderItem
            key={pregunta.idPregunta}
            number={index + 1}
            text={pregunta.texto || "Sin texto"}
            meta={
              <>
                {formatPreguntaTipo(pregunta.tipo)}
                {" · "}
                {pregunta.puntaje ?? 1} pts
              </>
            }
            warn={isPreguntaWarn?.(pregunta)}
            active={
              selected?.type === "pregunta" && selected.id === pregunta.idPregunta
            }
            onClick={() => onSelectPregunta(pregunta.idPregunta)}
          />
        ))}
      </ExamenBuilderSidebar>

      <ExamenBuilderMain>
        <header className={styles.builderMainHeader}>
          <ExamenBuilderPanelTitle>
            <FileQuestion size={17} aria-hidden="true" />
            <span>{detail.areaNombre ?? "Examen diagnóstico"}</span>
          </ExamenBuilderPanelTitle>
          <EstatusBadge estatus={detail.estatus} />
        </header>
        <div className={styles.builderMainContent}>
          {children}
          {footer}
        </div>
      </ExamenBuilderMain>
    </ExamenBuilder>
  );
}
