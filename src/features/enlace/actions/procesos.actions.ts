"use server";

import { runServerAction, type ActionResult } from "@/lib/actions";
import {
  getProceso,
  getProcesoHorasResumen,
  listProcesoCartas,
  listProcesoDocumentos,
} from "../services/procesos.service";
import type {
  CartaMetadataResponse,
  DocumentoEstatusResponse,
  HorasResumenResponse,
  ProcesoDetalleResponse,
} from "../types/enlace.types";

export type EnlaceProcesoDetailPayload = {
  proceso: ProcesoDetalleResponse;
  horasResumen: HorasResumenResponse | null;
  documentos: DocumentoEstatusResponse[];
  cartas: CartaMetadataResponse[];
};

export async function getProcesoDetailAction(
  idProceso: number,
): Promise<ActionResult<EnlaceProcesoDetailPayload>> {
  return runServerAction(async () => {
    const [proceso, horasResumen, documentos, cartas] = await Promise.all([
      getProceso(idProceso),
      getProcesoHorasResumen(idProceso).catch(() => null),
      listProcesoDocumentos(idProceso),
      listProcesoCartas(idProceso),
    ]);

    return { proceso, horasResumen, documentos, cartas };
  }, "No pudimos cargar la información del proceso.");
}
