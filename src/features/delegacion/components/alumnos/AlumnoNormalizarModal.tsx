"use client";

import { GraduationCap } from "lucide-react";
import { usePanelRouter } from "@/features/panel/hooks/usePanelRouter";
import { useEffect, useState } from "react";
import {
  createEscuelaAndNormalizeAlumnoAction,
  getAlumnoCvAction,
  normalizeAlumnoEscuelaAction,
} from "../../actions/alumnos.actions";
import type { AlumnoPorNormalizarResponse } from "../../types/delegacion.types";
import type { EscuelaResponse } from "@/lib/domain";
import { mapActionFieldErrors } from "@/lib/actions/form-errors";
import { compactPayload } from "@/lib/actions/normalize-server-args";
import { notify } from "@/shared/notifications";
import { Button } from "@/shared/components/Button";
import { SelectInput, TextInput } from "@/shared/components/Form";
import { DetailModalHero } from "@/shared/components/DetailModal";
import { Modal } from "@/shared/components/Modal";
import { LoadingState } from "@/shared/components/LoadingState";
import { EstatusBadge } from "@/shared/components/StatusBadge";
import detailStyles from "@/shared/styles/DetailModal.module.css";
import formStyles from "@/shared/styles/PanelFormModal.module.css";

type NuevaEscuelaForm = {
  nombreOficial: string;
  nombreCorto: string;
  correoContacto: string;
};

type FieldErrors = Partial<Record<"escuelaId" | keyof NuevaEscuelaForm, string>>;

function buildNuevaEscuelaInitial(alumno: AlumnoPorNormalizarResponse): NuevaEscuelaForm {
  return {
    nombreOficial: alumno.escuelaTextoCapturada?.trim() ?? "",
    nombreCorto: "",
    correoContacto: "",
  };
}

function AlumnoNormalizarModalContent({
  alumno,
  escuelas,
  onClose,
}: {
  alumno: AlumnoPorNormalizarResponse;
  escuelas: EscuelaResponse[];
  onClose: () => void;
}) {
  const router = usePanelRouter();
  const [cvLoading, setCvLoading] = useState(true);
  const [cvSummary, setCvSummary] = useState<string | null>(null);
  const [escuelaId, setEscuelaId] = useState(escuelas[0] ? String(escuelas[0].idEscuela) : "");
  const [nuevaEscuela, setNuevaEscuela] = useState(() => buildNuevaEscuelaInitial(alumno));
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isMutating, setIsMutating] = useState(false);
  const [mode, setMode] = useState<"vincular" | "crear">("vincular");

  useEffect(() => {
    const selectedAlumnoId = alumno.idAlumno;
    let cancelled = false;

    async function loadCv() {
      setCvLoading(true);
      const result = await getAlumnoCvAction(selectedAlumnoId);
      if (cancelled) return;
      if (result.success) {
        setCvSummary(
          result.data.perfilProfesional?.trim() ||
            "El alumno no tiene perfil profesional registrado.",
        );
      }
      setCvLoading(false);
    }

    void loadCv();

    return () => {
      cancelled = true;
    };
  }, [alumno.idAlumno]);

  const clearFieldError = (field: keyof FieldErrors) => {
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
  };

  const applyActionFailure = (error: string, actionFieldErrors?: Record<string, string[]>) => {
    const mapped = mapActionFieldErrors(actionFieldErrors);
    setFieldErrors(mapped);

    const firstFieldError = Object.values(mapped)[0];
    notify.error(firstFieldError ?? error);
  };

  const switchMode = (next: "vincular" | "crear") => {
    setMode(next);
    setFieldErrors({});
  };

  const updateNuevaEscuela = (field: keyof NuevaEscuelaForm, value: string) => {
    setNuevaEscuela((current) => ({ ...current, [field]: value }));
    clearFieldError(field);
  };

  const handleVincular = async () => {
    if (!escuelaId) {
      const message =
        escuelas.length === 0
          ? "No hay escuelas registradas. Usa «Registrar escuela nueva»."
          : "Selecciona la escuela a vincular.";
      setFieldErrors({ escuelaId: message });
      notify.error(message);
      return;
    }

    setIsMutating(true);
    setFieldErrors({});
    const result = await normalizeAlumnoEscuelaAction(alumno.idAlumno, {
      escuelaId: Number(escuelaId),
    });
    setIsMutating(false);

    if (!result.success) {
      applyActionFailure(result.error, result.fieldErrors);
      return;
    }

    notify.success("Escuela vinculada correctamente.");
    router.refresh();
    onClose();
  };

  const handleCrear = async () => {
    const nombreOficial = nuevaEscuela.nombreOficial.trim();
    if (!nombreOficial) {
      const message = "Escribe el nombre oficial de la escuela.";
      setFieldErrors({ nombreOficial: message });
      notify.error(message);
      return;
    }

    setIsMutating(true);
    setFieldErrors({});
    const result = await createEscuelaAndNormalizeAlumnoAction(
      alumno.idAlumno,
      compactPayload({
        nombreOficial,
        nombreCorto: nuevaEscuela.nombreCorto.trim() || undefined,
        correoContacto: nuevaEscuela.correoContacto.trim() || undefined,
      }),
    );
    setIsMutating(false);

    if (!result.success) {
      applyActionFailure(result.error, result.fieldErrors);
      return;
    }

    notify.success("Escuela registrada y vinculada al alumno.");
    router.refresh();
    onClose();
  };

  return (
    <div className={[detailStyles.layout, detailStyles.modalBody].join(" ")}>
      <DetailModalHero
        icon={GraduationCap}
        title={alumno.nombreCompleto ?? "Alumno"}
        subtitle={alumno.escuelaTextoCapturada ?? "Sin escuela capturada"}
        badges={
          <EstatusBadge
            estatus={alumno.estatusVinculacionEscuela}
            fallback="Pendiente de vincular"
            variant="label"
          />
        }
      />

      {cvLoading ? <LoadingState label="Cargando CV…" /> : null}
      {!cvLoading && cvSummary ? (
        <section className={detailStyles.contentPanel}>
          <div className={detailStyles.panelHeader}>
            <h3 className={detailStyles.panelTitle}>Perfil profesional</h3>
          </div>
          <p className={detailStyles.panelDescription}>{cvSummary}</p>
        </section>
      ) : null}

      <section className={detailStyles.contentPanel} aria-label="Vincular escuela">
        <div className={detailStyles.panelHeader}>
          <h3 className={detailStyles.panelTitle}>Vincular escuela</h3>
          <p className={detailStyles.panelDescription}>
            Asocia al alumno con una escuela existente o registra una nueva.
          </p>
        </div>

        <div className={formStyles.formActions}>
          <Button
            type="button"
            variant={mode === "vincular" ? "primary" : "outline"}
            onClick={() => switchMode("vincular")}
          >
            Vincular escuela existente
          </Button>
          <Button
            type="button"
            variant={mode === "crear" ? "primary" : "outline"}
            onClick={() => switchMode("crear")}
          >
            Registrar escuela nueva
          </Button>
        </div>

        {mode === "vincular" ? (
          <div className={formStyles.formLayout}>
            <SelectInput
              id="escuela-id"
              label="Escuela"
              value={escuelaId}
              error={fieldErrors.escuelaId}
              onChange={(event) => {
                setEscuelaId(event.target.value);
                clearFieldError("escuelaId");
              }}
            >
              {escuelas.length === 0 ? (
                <option value="">Sin escuelas disponibles</option>
              ) : null}
              {escuelas.map((escuela) => (
                <option key={escuela.idEscuela} value={escuela.idEscuela}>
                  {escuela.nombreOficial}
                </option>
              ))}
            </SelectInput>
            <div className={formStyles.formActions}>
              <Button
                type="button"
                variant="primary"
                disabled={isMutating}
                onClick={() => void handleVincular()}
              >
                Vincular escuela
              </Button>
            </div>
          </div>
        ) : (
          <div className={formStyles.formLayout}>
            <TextInput
              id="esc-nombre-oficial"
              label="Nombre oficial"
              required
              value={nuevaEscuela.nombreOficial}
              error={fieldErrors.nombreOficial}
              hint="Tal como aparece en la credencial o documentación oficial."
              onChange={(event) => updateNuevaEscuela("nombreOficial", event.target.value)}
            />
            <TextInput
              id="esc-nombre-corto"
              label="Nombre corto"
              value={nuevaEscuela.nombreCorto}
              error={fieldErrors.nombreCorto}
              onChange={(event) => updateNuevaEscuela("nombreCorto", event.target.value)}
            />
            <TextInput
              id="esc-correo"
              label="Correo de contacto"
              type="email"
              value={nuevaEscuela.correoContacto}
              error={fieldErrors.correoContacto}
              onChange={(event) => updateNuevaEscuela("correoContacto", event.target.value)}
            />
            <div className={formStyles.formActions}>
              <Button
                type="button"
                variant="primary"
                disabled={isMutating}
                onClick={() => void handleCrear()}
              >
                Registrar y vincular
              </Button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export function AlumnoNormalizarModal({
  alumno,
  escuelas,
  open,
  onClose,
}: {
  alumno: AlumnoPorNormalizarResponse | null;
  escuelas: EscuelaResponse[];
  open: boolean;
  onClose: () => void;
}) {
  if (!open || !alumno) {
    return null;
  }

  return (
    <Modal open title={alumno.nombreCompleto ?? "Alumno"} onClose={onClose} size="lg">
      <AlumnoNormalizarModalContent
        key={alumno.idAlumno}
        alumno={alumno}
        escuelas={escuelas}
        onClose={onClose}
      />
    </Modal>
  );
}
