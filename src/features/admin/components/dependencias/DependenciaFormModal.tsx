"use client";

import { usePanelRouter } from "@/features/panel/hooks/usePanelRouter";
import { useState, type FormEvent } from "react";
import {
  createDependenciaAction,
  updateDependenciaAction,
} from "../../actions/dependencias.actions";
import { mapActionFieldErrors } from "@/lib/actions/form-errors";
import type { DependenciaResponse } from "../../types/dependencia.types";
import { notify } from "@/shared/notifications";
import { Button } from "@/shared/components/Button";
import { FormField, TextInput } from "@/shared/components/Form";
import formStyles from "@/shared/components/Form/Form.module.css";
import { Modal } from "@/shared/components/Modal";
import styles from "@/shared/styles/PanelFormModal.module.css";

type DependenciaFormModalProps = {
  open: boolean;
  mode: "create" | "edit";
  dependencia?: DependenciaResponse | null;
  onClose: () => void;
  onSuccess?: () => void;
};

type FormValues = {
  nombre: string;
  clave: string;
  siglas: string;
  descripcion: string;
};

function buildInitialValues(
  mode: DependenciaFormModalProps["mode"],
  dependencia?: DependenciaResponse | null,
): FormValues {
  if (mode === "edit" && dependencia) {
    return {
      nombre: dependencia.nombre ?? "",
      clave: dependencia.clave ?? "",
      siglas: dependencia.siglas ?? "",
      descripcion: dependencia.descripcion ?? "",
    };
  }

  return {
    nombre: "",
    clave: "",
    siglas: "",
    descripcion: "",
  };
}

function DependenciaFormModalContent({
  mode,
  dependencia,
  onClose,
  onSuccess,
}: Omit<DependenciaFormModalProps, "open">) {
  const router = usePanelRouter();
  const [values, setValues] = useState(() => buildInitialValues(mode, dependencia));
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof FormValues, string>>>(
    {},
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field: keyof FormValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nombre = values.nombre.trim();
    if (!nombre) {
      setFieldErrors({ nombre: "Escribe el nombre de la dependencia." });
      return;
    }

    setIsSubmitting(true);

    const payload = {
      nombre,
      clave: values.clave.trim() || undefined,
      siglas: values.siglas.trim() || undefined,
      descripcion: values.descripcion.trim() || undefined,
    };

    const result =
      mode === "create"
        ? await createDependenciaAction(payload)
        : await updateDependenciaAction(dependencia!.idDependencia, payload);

    setIsSubmitting(false);

    if (!result.success) {
      notify.error(result.error);
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
      title={mode === "create" ? "Dar de alta dependencia" : "Editar dependencia"}
      onClose={onClose}
      size="lg"
      footer={
        <div className={styles.modalFooter}>
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" form="dependencia-form" variant="success" disabled={isSubmitting}>
            {isSubmitting
              ? "Guardando…"
              : mode === "create"
                ? "Registrar dependencia"
                : "Guardar cambios"}
          </Button>
        </div>
      }
    >
      <form id="dependencia-form" className={styles.formLayout} onSubmit={handleSubmit}>

        <section className={styles.formSection} aria-label="Información de la dependencia">
          <p className={styles.formSectionTitle}>Información general</p>
          <div className={styles.formGrid}>
          <div className={styles.formGridFull}>
            <TextInput
              id="dependencia-nombre"
              label="Nombre de la dependencia"
              value={values.nombre}
              required
              error={fieldErrors.nombre}
              onChange={(event) => updateField("nombre", event.target.value)}
            />
          </div>

          <TextInput
            id="dependencia-clave"
            label="Clave de registro"
            hint="Opcional. Identificador interno de la dependencia."
            value={values.clave}
            error={fieldErrors.clave}
            onChange={(event) => updateField("clave", event.target.value)}
          />

          <TextInput
            id="dependencia-siglas"
            label="Siglas"
            value={values.siglas}
            error={fieldErrors.siglas}
            onChange={(event) => updateField("siglas", event.target.value)}
          />

          <div className={styles.formGridFull}>
            <FormField
              id="dependencia-descripcion"
              label="Descripción"
              error={fieldErrors.descripcion}
            >
              <textarea
                id="dependencia-descripcion"
                className={formStyles.textarea}
                value={values.descripcion}
                rows={4}
                onChange={(event) => updateField("descripcion", event.target.value)}
              />
            </FormField>
          </div>
          </div>
        </section>
      </form>
    </Modal>
  );
}

export function DependenciaFormModal({
  open,
  mode,
  dependencia,
  onClose,
  onSuccess,
}: DependenciaFormModalProps) {
  if (!open) {
    return null;
  }

  return (
    <DependenciaFormModalContent
      key={mode === "edit" ? `edit-${dependencia?.idDependencia}` : "create"}
      mode={mode}
      dependencia={dependencia}
      onClose={onClose}
      onSuccess={onSuccess}
    />
  );
}
