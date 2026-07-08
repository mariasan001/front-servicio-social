import { getApiErrorMessage } from "@/lib/api/errors";
import { Alert } from "@/shared/components/Alert";
import { DelegacionEncuestasView } from "../components/encuestas/DelegacionEncuestasView";
import { listEncuestasSatisfaccion } from "../services/encuestas.service";

export async function DelegacionEncuestasSection() {
  const result = await listEncuestasSatisfaccion({ page: 0, size: 100 })
    .then((encuestas) => ({ encuestas }))
    .catch((error: unknown) => ({
      error: getApiErrorMessage(
        error,
        "No pudimos cargar las encuestas de satisfacción.",
      ),
    }));

  if ("error" in result) {
    return <Alert tone="error">{result.error}</Alert>;
  }

  return <DelegacionEncuestasView encuestas={result.encuestas} />;
}
