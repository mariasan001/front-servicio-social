"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  createEscuelaAndNormalizeAlumnoAction,
  getAlumnoCvAction,
  normalizeAlumnoEscuelaAction,
} from "../../actions/alumnos.actions";
import type { AlumnoPorNormalizarResponse } from "../../types/delegacion.types";
import type { EscuelaResponse } from "@/features/admin/types/escuela.types";
import { estatusTone, formatEtiqueta } from "@/lib/domain/labels";
import { Alert } from "@/shared/components/Alert";
import { Button } from "@/shared/components/Button";
import { SelectInput, TextInput } from "@/shared/components/Form";
import { Modal } from "@/shared/components/Modal";
import { LoadingState } from "@/shared/components/LoadingState";
import { StatusBadge } from "@/shared/components/StatusBadge";
import styles from "@/shared/styles/PanelSectionView.module.css";

function AlumnoNormalizarModalContent({
  alumno,
  escuelas,
  onClose,
}: {
  alumno: AlumnoPorNormalizarResponse;
  escuelas: EscuelaResponse[];
  onClose: () => void;
}) {
  const router = useRouter();
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
    <div className={styles.detailLayout}>
      <StatusBadge tone={estatusTone(alumno.estatusVinculacionEscuela)}>
        {formatEtiqueta(alumno.estatusVinculacionEscuela, "Pendiente de vincular")}
      </StatusBadge>
      <p className={styles.detailLead}>
        Escuela capturada: <strong>{alumno.escuelaTextoCapturada ?? "Sin dato"}</strong>
      </p>
      {cvLoading ? <LoadingState label="Cargando CV…" /> : null}
      {!cvLoading && cvSummary ? <p className={styles.detailLead}>{cvSummary}</p> : null}
      {error ? <Alert tone="error">{error}</Alert> : null}

      <div className={styles.detailActions}>
        <Button
          type="button"
          variant={mode === "vincular" ? "primary" : "outline"}
          onClick={() => setMode("vincular")}
        >
          Vincular escuela existente
        </Button>
        <Button
          type="button"
          variant={mode === "crear" ? "primary" : "outline"}
          onClick={() => setMode("crear")}
        >
          Registrar escuela nueva
        </Button>
      </div>

      {mode === "vincular" ? (
        <div className={styles.inlineForm}>
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
          <Button type="button" disabled={isMutating} onClick={() => void handleVincular()}>
            Vincular escuela
          </Button>
        </div>
      ) : (
        <div className={styles.inlineForm}>
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
          <Button type="button" disabled={isMutating} onClick={() => void handleCrear()}>
            Registrar y vincular
          </Button>
        </div>
      )}
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
