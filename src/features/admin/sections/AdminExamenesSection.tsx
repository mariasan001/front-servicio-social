import { getApiErrorMessage } from "@/lib/api/errors";
import { Alert } from "@/shared/components/Alert";
import { ExamenesMonitorView } from "@/shared/components/examen/ExamenesMonitorView";
import { listExamenesMonitor } from "@/lib/services/examenes-monitor.service";

export async function AdminExamenesSection() {
  const result = await listExamenesMonitor()
    .then((examenes) => ({ examenes }))
    .catch((error: unknown) => ({
      error: getApiErrorMessage(error, "No pudimos cargar los exámenes."),
    }));

  if ("error" in result) {
    return <Alert tone="error">{result.error}</Alert>;
  }

  return (
    <ExamenesMonitorView
      examenes={result.examenes}
      titleId="admin-examenes-title"
      title="Exámenes diagnóstico"
      description="Consulta los exámenes creados por titulares en todo el sistema."
    />
  );
}
