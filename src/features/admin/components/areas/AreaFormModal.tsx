"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { createAreaAction, updateAreaAction } from "../../actions/areas.actions";
import { mapActionFieldErrors } from "@/lib/actions/form-errors";
import type { AreaResponse } from "../../types/area.types";
import type { DependenciaResponse } from "../../types/dependencia.types";
import { Alert } from "@/shared/components/Alert";
import { Button } from "@/shared/components/Button";
import { FormField, SelectInput, TextInput } from "@/shared/components/Form";
import formStyles from "@/shared/components/Form/Form.module.css";
import { Modal } from "@/shared/components/Modal";
import styles from "@/shared/styles/PanelFormModal.module.css";

type AreaFormModalProps = {
  open: boolean;
  mode: "create" | "edit";
  area?: AreaResponse | null;
  dependencias: DependenciaResponse[];
  onClose: () => void;
  onSuccess?: () => void;
};

type FormValues = {
  dependenciaId: string;
  nombre: string;
  descripcion: string;
  ubicacion: string;
  correoContacto: string;
  telefonoContacto: string;
};

const EMPTY_VALUES: FormValues = {
  dependenciaId: "",
  nombre: "",
  descripcion: "",
  ubicacion: "",
  correoContacto: "",
  telefonoContacto: "",
};

function buildInitialValues(
  mode: AreaFormModalProps["mode"],
  area: AreaResponse | null | undefined,
  dependencias: DependenciaResponse[],
): FormValues {
  if (mode === "edit" && area) {
    return {
      dependenciaId: String(area.dependenciaId),
      nombre: area.nombre ?? "",
      descripcion: area.descripcion ?? "",
      ubicacion: area.ubicacion ?? "",
      correoContacto: area.correoContacto ?? "",
      telefonoContacto: area.telefonoContacto ?? "",
    };
  }

  return {
    ...EMPTY_VALUES,
    dependenciaId: dependencias[0] ? String(dependencias[0].idDependencia) : "",
  };
}

function AreaFormModalContent({
  mode,
  area,
  dependencias,
  onClose,
  onSuccess,
}: Omit<AreaFormModalProps, "open">) {
  const router = useRouter();
  const [values, setValues] = useState(() => buildInitialValues(mode, area, dependencias));
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

    const nombre = values.nombre.trim();
    const dependenciaId = Number(values.dependenciaId);
    const errors: Partial<Record<keyof FormValues, string>> = {};

    if (!dependenciaId) {
      errors.dependenciaId = "Selecciona la dependencia a la que pertenece el área.";
    }

    if (!nombre) {
      errors.nombre = "Escribe el nombre del área.";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    const payload = {
      dependenciaId,
      nombre,
      descripcion: values.descripcion.trim() || undefined,
      ubicacion: values.ubicacion.trim() || undefined,
      correoContacto: values.correoContacto.trim() || undefined,
      telefonoContacto: values.telefonoContacto.trim() || undefined,
    };

    const result =
      mode === "create"
        ? await createAreaAction(payload)
        : await updateAreaAction(area!.idArea, payload);

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
      title={mode === "create" ? "Dar de alta área" : "Editar área"}
      onClose={onClose}
      size="lg"
      footer={
        <div className={styles.modalFooter}>
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" form="area-form" disabled={isSubmitting}>
            {isSubmitting
              ? "Guardando…"
              : mode === "create"
                ? "Registrar área"
                : "Guardar cambios"}
          </Button>
        </div>
      }
    >
      <form id="area-form" className={styles.formLayout} onSubmit={handleSubmit}>
        {formError ? <Alert tone="error">{formError}</Alert> : null}

        <section className={styles.formSection} aria-label="Información del área">
          <p className={styles.formSectionTitle}>Información general</p>
          <div className={styles.formGrid}>
          <div className={styles.formGridFull}>
            <SelectInput
              id="area-dependencia"
              label="Dependencia"
              required
              placeholder="Selecciona una dependencia"
              value={values.dependenciaId}
              error={fieldErrors.dependenciaId}
              onChange={(event) => updateField("dependenciaId", event.target.value)}
            >
              {dependencias.map((dependencia) => (
                <option key={dependencia.idDependencia} value={dependencia.idDependencia}>
                  {dependencia.nombre}
                </option>
              ))}
            </SelectInput>
          </div>

          <div className={styles.formGridFull}>
            <TextInput
              id="area-nombre"
              label="Nombre del área"
              value={values.nombre}
              required
              error={fieldErrors.nombre}
              onChange={(event) => updateField("nombre", event.target.value)}
            />
          </div>

          <div className={styles.formGridFull}>
            <FormField id="area-descripcion" label="Descripción" error={fieldErrors.descripcion}>
              <textarea
                id="area-descripcion"
                className={formStyles.textarea}
                value={values.descripcion}
                rows={3}
                onChange={(event) => updateField("descripcion", event.target.value)}
              />
            </FormField>
          </div>

          <TextInput
            id="area-ubicacion"
            label="Ubicación"
            value={values.ubicacion}
            error={fieldErrors.ubicacion}
            onChange={(event) => updateField("ubicacion", event.target.value)}
          />

          <TextInput
            id="area-correo"
            label="Correo de contacto"
            type="email"
            value={values.correoContacto}
            error={fieldErrors.correoContacto}
            onChange={(event) => updateField("correoContacto", event.target.value)}
          />

          <TextInput
            id="area-telefono"
            label="Teléfono de contacto"
            value={values.telefonoContacto}
            error={fieldErrors.telefonoContacto}
            onChange={(event) => updateField("telefonoContacto", event.target.value)}
          />
          </div>
        </section>
      </form>
    </Modal>
  );
}

export function AreaFormModal({
  open,
  mode,
  area,
  dependencias,
  onClose,
  onSuccess,
}: AreaFormModalProps) {
  if (!open) {
    return null;
  }

  return (
    <AreaFormModalContent
      key={mode === "edit" ? `edit-${area?.idArea}` : "create"}
      mode={mode}
      area={area}
      dependencias={dependencias}
      onClose={onClose}
      onSuccess={onSuccess}
    />
  );
}
