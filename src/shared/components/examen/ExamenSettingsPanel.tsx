import type { ReactNode } from "react";
import { Settings2 } from "lucide-react";
import type { ExamenDiagnosticoDetalleResponse } from "@/lib/domain";
import { ExamenBuilderPanelTitle } from "./ExamenBuilder";
import { ExamenStatChips } from "./ExamenStatChips";
import detailStyles from "@/shared/styles/DetailModal.module.css";

type ExamenSettingsPanelProps = {
  exam: ExamenDiagnosticoDetalleResponse;
  totalPreguntas: number;
  headerActions?: ReactNode;
  beforeChips?: ReactNode;
};

export function ExamenSettingsPanel({
  exam,
  totalPreguntas,
  headerActions,
  beforeChips,
}: ExamenSettingsPanelProps) {
  return (
    <>
      <div className={detailStyles.panelHeader}>
        <ExamenBuilderPanelTitle>
          <Settings2 size={16} aria-hidden="true" />
          Datos del examen
        </ExamenBuilderPanelTitle>
        {headerActions}
      </div>

      {beforeChips}

      <ExamenStatChips
        totalPreguntas={totalPreguntas}
        puntajeMinimoAprobatorio={exam.puntajeMinimoAprobatorio}
        tiempoLimiteMinutos={exam.tiempoLimiteMinutos}
        estatus={exam.estatus}
      />

      {exam.descripcion ? (
        <section className={detailStyles.contentPanel}>
          <div className={detailStyles.panelHeader}>
            <h3 className={detailStyles.panelTitle}>Descripción</h3>
          </div>
          <p className={detailStyles.panelDescription}>{exam.descripcion}</p>
        </section>
      ) : null}

      {exam.instrucciones ? (
        <section className={detailStyles.contentPanel}>
          <div className={detailStyles.panelHeader}>
            <h3 className={detailStyles.panelTitle}>Instrucciones</h3>
          </div>
          <p className={detailStyles.panelDescription}>{exam.instrucciones}</p>
        </section>
      ) : null}
    </>
  );
}
