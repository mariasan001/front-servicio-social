import { usePanelRouter } from "@/features/panel/hooks/usePanelRouter";
import type { CartaDownloadKind } from "@/lib/domain";
import { cartaTipoIncludes } from "@/lib/domain";
import { tieneHorasRequeridas } from "@/lib/domain/proceso";
import { runDownloadAction } from "@/lib/utils/download-file";
import { notify } from "@/shared/notifications";
import { useRef, useState } from "react";
import { useDetailModalLoader } from "@/shared/hooks/useDetailModalLoader";
import {
  approveProcesoDocumentoAction,
  cancelProcesoAction,
  cancelProcesoHoraAction,
  downloadProcesoCartaArchivoAction,
  downloadProcesoDocumentoArchivoAction,
  emitProcesoCartaAction,
  emitProcesoCartaConArchivoAction,
  getProcesoDetailAction,
  observeProcesoDocumentoAction,
  observeProcesoHoraAction,
  rejectProcesoDocumentoAction,
  rejectProcesoHoraAction,
  setProcesoHorasRequeridasAction,
  validateProcesoHoraAction,
  type ProcesoDetailPayload,
} from "../../actions/procesos.actions";

type UseDelegacionProcesoDetailModalOptions = {
  open: boolean;
  procesoId: number | null;
};

export function useDelegacionProcesoDetailModal({
  open,
  procesoId,
}: UseDelegacionProcesoDetailModalOptions) {
  const router = usePanelRouter();
  const [isMutating, setIsMutating] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [motivoCancelacion, setMotivoCancelacion] = useState("");
  const [horasRequeridasDraft, setHorasRequeridasDraft] = useState<string | null>(null);
  const [comentario, setComentario] = useState("");
  const [documentoComentario, setDocumentoComentario] = useState("");
  const [activeDocumentoId, setActiveDocumentoId] = useState<number | null>(null);
  const [activeCartaId, setActiveCartaId] = useState<number | null>(null);
  const [cartaAceptacionFile, setCartaAceptacionFile] = useState<File | null>(null);
  const [cartaLiberacionFile, setCartaLiberacionFile] = useState<File | null>(null);
  const cartaAceptacionInput = useRef<HTMLInputElement | null>(null);

  const { detail, error, isLoading, isReloading } = useDetailModalLoader(
    open,
    procesoId,
    getProcesoDetailAction,
    {
      reloadKey,
      onBeforeLoad: () => {
        setMotivoCancelacion("");
        setComentario("");
        setDocumentoComentario("");
        setActiveDocumentoId(null);
        setActiveCartaId(null);
        setCartaAceptacionFile(null);
        setCartaLiberacionFile(null);
        setHorasRequeridasDraft(null);
      },
    },
  );

  const proceso = detail?.proceso;
  const documentos = detail?.documentos ?? [];
  const horas = detail?.horas ?? [];
  const cartas = detail?.cartas ?? [];

  const horasRequeridas =
    horasRequeridasDraft ??
    (proceso?.horasRequeridas != null && proceso.horasRequeridas > 0
      ? String(proceso.horasRequeridas)
      : "");

  const refresh = () => {
    router.refresh();
    setReloadKey((key) => key + 1);
  };

  const guardarHoras = async () => {
    if (!proceso) return false;
    const horasValue = Number(horasRequeridas);
    if (!horasRequeridas.trim() || Number.isNaN(horasValue) || horasValue <= 0) {
      notify.error("Indica un número válido de horas requeridas.");
      return false;
    }
    setIsMutating(true);
    const result = await setProcesoHorasRequeridasAction(proceso.idProceso, horasValue);
    setIsMutating(false);
    if (!result.success) {
      notify.error(result.error);
      return false;
    }
    notify.success(
      "Horas guardadas. Puedes activar al alumno cuando estés listo; el PDF se generará al activar.",
    );
    refresh();
    return true;
  };

  const guardarHorasSiFaltan = async () => {
    if (!proceso) return false;

    const horasValue = Number(horasRequeridas);
    const horasCambiaron =
      horasRequeridas.trim() &&
      !Number.isNaN(horasValue) &&
      horasValue > 0 &&
      proceso.horasRequeridas !== horasValue;

    if (tieneHorasRequeridas(proceso.horasRequeridas) && !horasCambiaron) {
      return true;
    }

    return guardarHoras();
  };

  const activarAlumno = async () => {
    if (!proceso) return;

    const horasGuardadas = await guardarHorasSiFaltan();
    if (!horasGuardadas) return;

    setIsMutating(true);
    const result = cartaAceptacionFile
      ? await (() => {
          const formData = new FormData();
          formData.append("archivo", cartaAceptacionFile);
          return emitProcesoCartaConArchivoAction(proceso.idProceso, "aceptacion", formData);
        })()
      : await emitProcesoCartaAction(proceso.idProceso, "aceptacion");
    setIsMutating(false);

    if (!result.success) {
      notify.error(result.error);
      return;
    }

    setCartaAceptacionFile(null);
    if (cartaAceptacionInput.current) {
      cartaAceptacionInput.current.value = "";
    }
    notify.success(
      cartaAceptacionFile
        ? "Alumno activado con el PDF que subiste."
        : "Alumno activado. Se generó y emitió la carta de aceptación en PDF.",
    );
    refresh();
  };

  const runDocAction = async (
    action: "approve" | "observe" | "reject",
    idProcesoDocumento: number,
    comentarioValue = documentoComentario,
  ) => {
    if (!proceso) return;
    if (action === "observe" && !comentarioValue.trim()) {
      notify.error("Escribe una observación para el alumno.");
      return;
    }
    if (action === "reject" && !comentarioValue.trim()) {
      notify.error("Escribe el motivo del rechazo.");
      return;
    }
    setIsMutating(true);
    const body = { comentario: comentarioValue.trim() };
    const result =
      action === "approve"
        ? await approveProcesoDocumentoAction(proceso.idProceso, idProcesoDocumento)
        : action === "observe"
          ? await observeProcesoDocumentoAction(proceso.idProceso, idProcesoDocumento, body)
          : await rejectProcesoDocumentoAction(proceso.idProceso, idProcesoDocumento, body);
    setIsMutating(false);
    if (!result.success) {
      notify.error(result.error);
      return;
    }
    setDocumentoComentario("");
    setActiveDocumentoId(null);
    refresh();
  };

  const runHoraAction = async (
    action: "validate" | "observe" | "reject" | "cancel",
    idAsistencia: number,
  ) => {
    if (!proceso) return;
    setIsMutating(true);
    const result =
      action === "validate"
        ? await validateProcesoHoraAction(
            proceso.idProceso,
            idAsistencia,
            comentario.trim() ? { comentario: comentario.trim() } : {},
          )
        : action === "observe"
          ? await observeProcesoHoraAction(proceso.idProceso, idAsistencia, {
              comentario: comentario.trim() || "Observación registrada.",
            })
          : action === "reject"
            ? await rejectProcesoHoraAction(proceso.idProceso, idAsistencia, {
                comentario: comentario.trim() || "Registro rechazado.",
              })
            : await cancelProcesoHoraAction(proceso.idProceso, idAsistencia, {
                motivo: comentario.trim() || "Cancelado por delegación.",
              });
    setIsMutating(false);
    if (!result.success) {
      notify.error(result.error);
      return;
    }
    if (action === "observe") {
      notify.success(
        "Registro observado. El alumno solo podrá corregir las actividades realizadas, no el horario.",
      );
    } else if (action === "validate") {
      notify.success(
        "Registro validado. Si el alumno ya completó las horas requeridas, el titular podrá registrar la evaluación final.",
      );
    }
    setComentario("");
    refresh();
  };

  const hasCarta = (kind: CartaDownloadKind) =>
    cartas.some((carta) => cartaTipoIncludes(carta.tipoCarta, kind));

  const downloadDocumento = async (idProcesoDocumento: number) => {
    if (!proceso) return;
    setIsMutating(true);
    await runDownloadAction(
      () => downloadProcesoDocumentoArchivoAction(proceso.idProceso, idProcesoDocumento),
      notify.error,
    );
    setIsMutating(false);
  };

  const downloadCarta = async (kind: CartaDownloadKind) => {
    if (!proceso) return;
    setIsMutating(true);
    await runDownloadAction(
      () => downloadProcesoCartaArchivoAction(proceso.idProceso, kind),
      notify.error,
    );
    setIsMutating(false);
  };

  const emitCarta = async (kind: CartaDownloadKind, withFile: boolean) => {
    if (!proceso) return;
    const file = withFile ? cartaLiberacionFile : null;

    if (withFile && !file) {
      notify.error("Selecciona un archivo PDF para emitir la carta.");
      return;
    }

    setIsMutating(true);
    const result = withFile
      ? await (() => {
          const formData = new FormData();
          formData.append("archivo", file as File);
          return emitProcesoCartaConArchivoAction(proceso.idProceso, kind, formData);
        })()
      : await emitProcesoCartaAction(proceso.idProceso, kind);
    setIsMutating(false);

    if (!result.success) {
      notify.error(result.error);
      return;
    }

    setCartaLiberacionFile(null);
    if (kind === "aceptacion") {
      notify.success(
        "Proceso activado. Se emitió la carta de aceptación y el alumno ya puede registrar horas.",
      );
    } else {
      notify.success("Carta de liberación emitida correctamente.");
    }
    refresh();
  };

  const cancelarProceso = async () => {
    if (!proceso) return;
    if (!motivoCancelacion.trim()) {
      notify.error("Escribe el motivo de cancelación.");
      return;
    }
    setIsMutating(true);
    const result = await cancelProcesoAction(proceso.idProceso, {
      motivo: motivoCancelacion.trim(),
    });
    setIsMutating(false);
    if (!result.success) {
      notify.error(result.error);
      return;
    }
    refresh();
  };

  const activeDocumento =
    documentos.find((doc) => doc.idProcesoDocumento === activeDocumentoId) ?? null;
  const activeCarta = cartas.find((carta) => carta.idCarta === activeCartaId) ?? null;

  return {
    detail: detail as ProcesoDetailPayload | null,
    error,
    isLoading,
    isReloading,
    isMutating,
    proceso,
    documentos,
    horas,
    cartas,
    motivoCancelacion,
    setMotivoCancelacion,
    horasRequeridas,
    setHorasRequeridasDraft,
    comentario,
    setComentario,
    documentoComentario,
    setDocumentoComentario,
    activeDocumentoId,
    setActiveDocumentoId,
    activeCartaId,
    setActiveCartaId,
    cartaAceptacionFile,
    setCartaAceptacionFile,
    cartaLiberacionFile,
    setCartaLiberacionFile,
    activeDocumento,
    activeCarta,
    guardarHoras,
    activarAlumno,
    runDocAction,
    runHoraAction,
    hasCarta,
    downloadDocumento,
    downloadCarta,
    emitCarta,
    cancelarProceso,
  };
}
