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
import { estatusTone, formatEtiqueta } from "@/lib/domain/labels";
import { Alert } from "@/shared/components/Alert";
import { Button } from "@/shared/components/Button";
import { SelectInput, TextInput } from "@/shared/components/Form";
import { DetailModalHero } from "@/shared/components/DetailModal";
import { Modal } from "@/shared/components/Modal";
import { LoadingState } from "@/shared/components/LoadingState";
import { StatusBadge } from "@/shared/components/StatusBadge";
import detailStyles from "@/shared/styles/DetailModal.module.css";
import formStyles from "@/shared/styles/PanelFormModal.module.css";

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
  const [nuevaEscuela, setNuevaEscuela] = useState({ nombre: "", clave: "", municipio: "" });
  const [error, setError] = useState<string | null>(null);
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

  const handleVincular = async () => {
    if (!escuelaId) return;
    setIsMutating(true);
    setError(null);
    const result = await normalizeAlumnoEscuelaAction(alumno.idAlumno, {
      escuelaId: Number(escuelaId),
    });
    setIsMutating(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    router.refresh();
    onClose();
  };

  const handleCrear = async () => {
    if (!nuevaEscuela.nombre.trim()) {
      setError("Escribe el nombre de la escuela.");
      return;
    }
    setIsMutating(true);
    setError(null);
    const result = await createEscuelaAndNormalizeAlumnoAction(alumno.idAlumno, {
      nombre: nuevaEscuela.nombre.trim(),
      clave: nuevaEscuela.clave.trim() || undefined,
      municipio: nuevaEscuela.municipio.trim() || undefined,
    });
    setIsMutating(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
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
          <StatusBadge tone={estatusTone(alumno.estatusVinculacionEscuela)}>
            {formatEtiqueta(alumno.estatusVinculacionEscuela, "Pendiente de vincular")}
          </StatusBadge>
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
      {error ? <Alert tone="error">{error}</Alert> : null}

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
          variant={mode === "vincular" ? "action" : "outline"}
          onClick={() => setMode("vincular")}
        >
          Vincular escuela existente
        </Button>
        <Button
          type="button"
          variant={mode === "crear" ? "action" : "outline"}
          onClick={() => setMode("crear")}
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
            onChange={(e) => setEscuelaId(e.target.value)}
          >
            {escuelas.map((escuela) => (
              <option key={escuela.idEscuela} value={escuela.idEscuela}>
                {escuela.nombreOficial}
              </option>
            ))}
          </SelectInput>
          <div className={formStyles.formActions}>
            <Button type="button" variant="primary" disabled={isMutating} onClick={() => void handleVincular()}>
              Vincular escuela
            </Button>
          </div>
        </div>
      ) : (
        <div className={formStyles.formLayout}>
          <TextInput
            id="esc-nombre"
            label="Nombre de la escuela"
            value={nuevaEscuela.nombre}
            onChange={(e) => setNuevaEscuela((c) => ({ ...c, nombre: e.target.value }))}
          />
          <TextInput
            id="esc-clave"
            label="Clave"
            value={nuevaEscuela.clave}
            onChange={(e) => setNuevaEscuela((c) => ({ ...c, clave: e.target.value }))}
          />
          <TextInput
            id="esc-mun"
            label="Municipio"
            value={nuevaEscuela.municipio}
            onChange={(e) => setNuevaEscuela((c) => ({ ...c, municipio: e.target.value }))}
          />
          <div className={formStyles.formActions}>
            <Button type="button" variant="primary" disabled={isMutating} onClick={() => void handleCrear()}>
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
