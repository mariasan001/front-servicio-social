import { getApiErrorMessage } from "@/lib/api/errors";
import { Alert } from "@/shared/components/Alert";
import { PageHeader } from "@/shared/components/PageHeader";
import { DelegacionDocumentosView } from "../components/documentos/DelegacionDocumentosView";
import { listDocumentosPendientes } from "../services/documentos.service";

export async function DelegacionDocumentosSection() {
  const result = await listDocumentosPendientes()
    .then((documentos) => ({ documentos }))
    .catch((error: unknown) => ({ error: getApiErrorMessage(error, "No pudimos cargar los documentos pendientes.") }));

  if ("error" in result) {
    return (
      <section>
        <PageHeader titleId="delegacion-doc-error" eyebrow="Delegación" title="Documentos" description="Validación documental pendiente." />
        <Alert tone="error">{result.error}</Alert>
      </section>
    );
  }

  return <DelegacionDocumentosView documentos={result.documentos} />;
}
