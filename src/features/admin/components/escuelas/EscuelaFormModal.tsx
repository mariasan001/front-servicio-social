"use client";

import { usePanelRouter } from "@/features/panel/hooks/usePanelRouter";
import { useState, type FormEvent } from "react";
import {
  createEscuelaAction,
  updateEscuelaAction,
} from "../../actions/escuelas.actions";
import { mapActionFieldErrors } from "@/lib/actions/form-errors";
import type { EscuelaDetalleResponse, EscuelaResponse } from "../../types/escuela.types";
import { formatEtiqueta, CONVENIO_ESTATUS_OPTIONS, normalizeConvenioEstatus } from "./escuela-labels";
import { Alert } from "@/shared/components/Alert";
import { Button } from "@/shared/components/Button";
import { FormField, SelectInput, TextInput } from "@/shared/components/Form";
import formStyles from "@/shared/components/Form/Form.module.css";
import { Modal } from "@/shared/components/Modal";
import styles from "@/shared/styles/PanelFormModal.module.css";

type EscuelaFormModalProps = {
  open: boolean;
  mode: "create" | "edit";
  escuela?: EscuelaResponse | EscuelaDetalleResponse | null;
  onClose: () => void;
  onSuccess?: () => void;
};

type FormValues = {
  nombreOficial: string;
  nombreCorto: string;
  clave: string;
  correoContacto: string;
  telefono: string;
  municipio: string;
  domicilio: string;
  estatus: string;
  convenioEstatus: string;
};

const EMPTY_VALUES: FormValues = {
  nombreOficial: "",
  nombreCorto: "",
  clave: "",
  correoContacto: "",
  telefono: "",
  municipio: "",
  domicilio: "",
  estatus: "ACTIVA",
  convenioEstatus: "SIN_CONVENIO",
};

function buildInitialValues(
  mode: EscuelaFormModalProps["mode"],
  escuela?: EscuelaResponse | EscuelaDetalleResponse | null,
): FormValues {
  if (mode === "edit" && escuela) {
    return {
      nombreOficial: escuela.nombreOficial ?? "",
      nombreCorto: escuela.nombreCorto ?? "",
      clave: escuela.clave ?? "",
      correoContacto: escuela.correoContacto ?? "",
      telefono: "telefono" in escuela ? (escuela.telefono ?? "") : "",
      municipio: escuela.municipio ?? "",
      domicilio: "domicilio" in escuela ? (escuela.domicilio ?? "") : "",
      estatus: escuela.estatus ?? "ACTIVA",
      convenioEstatus: normalizeConvenioEstatus(escuela.convenioEstatus),
    };
  }

  return EMPTY_VALUES;
}

function EscuelaFormModalContent({
  mode,
  escuela,
  onClose,
  onSuccess,
}: Omit<EscuelaFormModalProps, "open">) {
  const router = usePanelRouter();
  const [values, setValues] = useState(() => buildInitialValues(mode, escuela));
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof FormValues, string>>>(
    {},
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field: keyof FormValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
    setFormError(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nombreOficial = values.nombreOficial.trim();
    if (!nombreOficial) {
      setFieldErrors({ nombreOficial: "Escribe el nombre oficial de la escuela." });
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    const payload = {
      nombreOficial,
      nombreCorto: values.nombreCorto.trim() || undefined,
      clave: values.clave.trim() || undefined,
      correoContacto: values.correoContacto.trim() || undefined,
      telefono: values.telefono.trim() || undefined,
      municipio: values.municipio.trim() || undefined,
      domicilio: values.domicilio.trim() || undefined,
      estatus: values.estatus.trim() || undefined,
      convenioEstatus: values.convenioEstatus.trim() || undefined,
    };

    const result =
      mode === "create"
        ? await createEscuelaAction(payload)
        : await updateEscuelaAction(escuela!.idEscuela, payload);

    setIsSubmitting(false);

    if (!result.success) {
      setFormError(result.error);
      setFieldErrors(mapActionFieldErrors(result.fieldErrors));
      return;
    }

    router.refresh();
    onSuccess?.();
    onClose();
  };

  return (
    <Modal
      open
      title={mode === "create" ? "Dar de alta escuela" : "Editar escuela"}
      onClose={onClose}
      size="lg"
      footer={
        <div className={styles.modalFooter}>
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" form="escuela-form" variant="action" disabled={isSubmitting}>
            {isSubmitting
              ? "Guardando…"
              : mode === "create"
                ? "Registrar escuela"
                : "Guardar cambios"}
          </Button>
        </div>
      }
    >
      <form id="escuela-form" className={styles.formLayout} onSubmit={handleSubmit}>
        {formError ? <Alert tone="error">{formError}</Alert> : null}

        <section className={styles.formSection} aria-label="Información de la escuela">
          <p className={styles.formSectionTitle}>Información general</p>
          <div className={styles.formGrid}>
          <div className={styles.formGridFull}>
            <TextInput
              id="escuela-nombre"
              label="Nombre oficial"
              value={values.nombreOficial}
              required
              error={fieldErrors.nombreOficial}
              onChange={(event) => updateField("nombreOficial", event.target.value)}
            />
          </div>

          <TextInput
            id="escuela-nombre-corto"
            label="Nombre corto"
            value={values.nombreCorto}
            error={fieldErrors.nombreCorto}
            onChange={(event) => updateField("nombreCorto", event.target.value)}
          />

          <TextInput
            id="escuela-clave"
            label="Clave de registro"
            value={values.clave}
            error={fieldErrors.clave}
            onChange={(event) => updateField("clave", event.target.value)}
          />

          <TextInput
            id="escuela-municipio"
            label="Municipio"
            value={values.municipio}
            error={fieldErrors.municipio}
            onChange={(event) => updateField("municipio", event.target.value)}
          />

          <TextInput
            id="escuela-correo"
            label="Correo de contacto"
            type="email"
            value={values.correoContacto}
            error={fieldErrors.correoContacto}
            onChange={(event) => updateField("correoContacto", event.target.value)}
          />

          <TextInput
            id="escuela-telefono"
            label="Teléfono"
            value={values.telefono}
            error={fieldErrors.telefono}
            onChange={(event) => updateField("telefono", event.target.value)}
          />

          <div className={styles.formGridFull}>
            <FormField id="escuela-domicilio" label="Domicilio" error={fieldErrors.domicilio}>
              <textarea
                id="escuela-domicilio"
                className={formStyles.textarea}
                value={values.domicilio}
                rows={3}
                onChange={(event) => updateField("domicilio", event.target.value)}
              />
            </FormField>
          </div>

          <SelectInput
            id="escuela-estatus"
            label="Estatus de la escuela"
            value={values.estatus}
            error={fieldErrors.estatus}
            onChange={(event) => updateField("estatus", event.target.value)}
          >
            <option value="ACTIVA">Activa</option>
            <option value="INACTIVA">Inactiva</option>
          </SelectInput>

          <SelectInput
            id="escuela-convenio"
            label="Estatus del convenio"
            hint="Al dar de alta una escuela, el convenio inicia como sin convenio."
            value={values.convenioEstatus}
            error={fieldErrors.convenioEstatus}
            onChange={(event) => updateField("convenioEstatus", event.target.value)}
          >
            {CONVENIO_ESTATUS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {formatEtiqueta(option)}
              </option>
            ))}
          </SelectInput>
          </div>
        </section>
      </form>
    </Modal>
  );
}

export function EscuelaFormModal({
  open,
  mode,
  escuela,
  onClose,
  onSuccess,
}: EscuelaFormModalProps) {
  if (!open) {
    return null;
  }

  return (
    <EscuelaFormModalContent
      key={mode === "edit" ? `edit-${escuela?.idEscuela}` : "create"}
      mode={mode}
      escuela={escuela}
      onClose={onClose}
      onSuccess={onSuccess}
    />
  );
}
