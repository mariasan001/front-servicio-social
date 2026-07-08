"use client";

import { useState, useSyncExternalStore, type FormEvent } from "react";
import { getApiErrorMessage } from "@/lib/api/errors";
import { registerPublicEncuestaSatisfaccion } from "@/features/landing/services/public-encuestas.service";
import { notify } from "@/shared/notifications";
import { Button } from "@/shared/components/Button";
import { Modal } from "@/shared/components/Modal";
import { TextInput } from "@/shared/components/Form";
import formStyles from "@/shared/components/Form/Form.module.css";
import styles from "./AlumnoEncuestaSatisfaccionModal.module.css";

const FORM_ID = "alumno-encuesta-satisfaccion-form";

type EncuestaFormValues = {
  nombre: string;
  carrera: string;
  escuela: string;
  comentario: string;
};

type FieldErrors = Partial<Record<keyof EncuestaFormValues, string>>;

type AlumnoEncuestaSatisfaccionModalProps = {
  idProceso: number;
  estatus?: string;
  alumnoNombre?: string;
  escuelaDefault?: string;
};

function storageKey(idProceso: number) {
  return `ss:encuesta-satisfaccion:${idProceso}`;
}

function alreadyCompleted(idProceso: number) {
  try {
    return window.localStorage.getItem(storageKey(idProceso)) === "done";
  } catch {
    return false;
  }
}

function markCompleted(idProceso: number) {
  try {
    window.localStorage.setItem(storageKey(idProceso), "done");
  } catch {
    /* almacenamiento no disponible: la encuesta ya fue enviada al backend */
  }
}

function subscribeToStorage(callback: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

export function AlumnoEncuestaSatisfaccionModal({
  idProceso,
  estatus,
  alumnoNombre,
  escuelaDefault,
}: AlumnoEncuestaSatisfaccionModalProps) {
  const nombrePrefill = alumnoNombre?.trim() ?? "";
  const escuelaPrefill = escuelaDefault?.trim() ?? "";
  const nombreLocked = nombrePrefill.length > 0;
  const escuelaLocked = escuelaPrefill.length > 0;

  const [dismissed, setDismissed] = useState(false);
  const [values, setValues] = useState<EncuestaFormValues>({
    nombre: nombrePrefill,
    carrera: "",
    escuela: escuelaPrefill,
    comentario: "",
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLiberado = estatus?.trim().toUpperCase() === "LIBERADO";

  const completed = useSyncExternalStore(
    subscribeToStorage,
    () => alreadyCompleted(idProceso),
    () => false,
  );

  const open = isLiberado && !completed && !dismissed;

  const updateField = <K extends keyof EncuestaFormValues>(
    field: K,
    value: EncuestaFormValues[K],
  ) => {
    setValues((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
  };

  const validate = (formValues: EncuestaFormValues) => {
    const errors: FieldErrors = {};

    if (!formValues.nombre.trim()) {
      errors.nombre = "Ingresa tu nombre.";
    }

    if (!formValues.carrera.trim()) {
      errors.carrera = "Ingresa tu carrera.";
    }

    if (!formValues.escuela.trim()) {
      errors.escuela = "Ingresa la escuela donde realizaste tu servicio.";
    }

    if (!formValues.comentario.trim()) {
      errors.comentario = "Comparte tu experiencia.";
    }

    return errors;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationErrors = validate(values);
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      await registerPublicEncuestaSatisfaccion({
        nombre: values.nombre.trim(),
        carrera: values.carrera.trim(),
        escuela: values.escuela.trim(),
        comentario: values.comentario.trim(),
      });

      markCompleted(idProceso);
      setDismissed(true);
      notify.success("Gracias por compartir tu experiencia.");
    } catch (error) {
      notify.error(
        getApiErrorMessage(
          error,
          "No fue posible enviar tu encuesta. Intenta de nuevo.",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      title="Cuéntanos tu experiencia"
      onClose={() => setDismissed(true)}
      size="lg"
      footer={
        <div className={styles.footerActions}>
          <Button
            type="submit"
            form={FORM_ID}
            variant="primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Enviando encuesta…" : "Enviar encuesta"}
          </Button>
        </div>
      }
    >
      <p className={styles.intro}>
        ¡Felicidades! Concluiste tu servicio social. Antes de continuar,
        ayúdanos respondiendo esta breve encuesta de satisfacción. Tus
        comentarios mejoran la experiencia de futuros estudiantes.
      </p>

      <form
        id={FORM_ID}
        className={styles.fields}
        onSubmit={handleSubmit}
        noValidate
      >
        <TextInput
          id="alumno-encuesta-nombre"
          name="nombre"
          label="Nombre"
          value={values.nombre}
          error={fieldErrors.nombre}
          required
          readOnly={nombreLocked}
          className={nombreLocked ? styles.readonlyInput : undefined}
          hint={nombreLocked ? "Tomado de tu cuenta." : undefined}
          onChange={(event) => updateField("nombre", event.target.value)}
        />

        <TextInput
          id="alumno-encuesta-carrera"
          name="carrera"
          label="Carrera"
          placeholder="Ej. Ingeniería en Sistemas Computacionales"
          autoComplete="off"
          value={values.carrera}
          error={fieldErrors.carrera}
          required
          onChange={(event) => updateField("carrera", event.target.value)}
        />

        <TextInput
          id="alumno-encuesta-escuela"
          name="escuela"
          label="Donde realizaste tu servicio"
          value={values.escuela}
          error={fieldErrors.escuela}
          required
          readOnly={escuelaLocked}
          className={escuelaLocked ? styles.readonlyInput : undefined}
          hint={escuelaLocked ? "Tomado de tu proceso." : undefined}
          onChange={(event) => updateField("escuela", event.target.value)}
        />

        <label className={formStyles.field} htmlFor="alumno-encuesta-comentario">
          <span className={formStyles.label}>
            Comentario <span aria-hidden="true">*</span>
          </span>
          <textarea
            id="alumno-encuesta-comentario"
            name="comentario"
            className={formStyles.textarea}
            rows={4}
            value={values.comentario}
            required
            aria-invalid={fieldErrors.comentario ? true : undefined}
            aria-describedby={
              fieldErrors.comentario
                ? "alumno-encuesta-comentario-error"
                : undefined
            }
            onChange={(event) => updateField("comentario", event.target.value)}
          />
          {fieldErrors.comentario ? (
            <span
              id="alumno-encuesta-comentario-error"
              className={formStyles.error}
            >
              {fieldErrors.comentario}
            </span>
          ) : null}
        </label>
      </form>
    </Modal>
  );
}
