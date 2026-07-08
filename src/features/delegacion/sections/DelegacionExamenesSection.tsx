import { getApiErrorMessage } from "@/lib/api/errors";
import { Alert } from "@/shared/components/Alert";
import { DelegacionExamenesView } from "../components/examenes/DelegacionExamenesView";
import { listExamenesMonitor } from "../services/examenes.service";

export async function DelegacionExamenesSection() {
  const result = await listExamenesMonitor()
    .then((examenes) => ({ examenes }))
    .catch((error: unknown) => ({
      error: getApiErrorMessage(error, "No pudimos cargar los exámenes."),
    }));

  if ("error" in result) {
    return <Alert tone="error">{result.error}</Alert>;
  }

  return <DelegacionExamenesView examenes={result.examenes} />;
}
