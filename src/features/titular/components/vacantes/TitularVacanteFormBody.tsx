"use client";

import { type FormEvent } from "react";
import { MODALIDAD_TRABAJO_OPTIONS } from "../../constants/vacante-form";
import { MODALIDAD_CATALOGO_OPTIONS } from "@/lib/domain/modalidad";
import { Alert } from "@/shared/components/Alert";
import { CheckboxField, FormField, SelectInput, TextInput } from "@/shared/components/Form";
import formStyles from "@/shared/components/Form/Form.module.css";
import { VacanteContextBanner } from "./VacanteContextBanner";
import type { useTitularVacanteForm } from "./useTitularVacanteForm";
import styles from "./TitularVacanteFormModal.module.css";

type TitularVacanteFormBodyProps = {
  form: ReturnType<typeof useTitularVacanteForm>;
  areaContextHint?: string;
  onSubmit: () => void;
};

export function TitularVacanteFormBody({
  form,
  areaContextHint,
  onSubmit,
}: TitularVacanteFormBodyProps) {
  const selectedModalidad = MODALIDAD_TRABAJO_OPTIONS.find(
    (option) => option.value === form.values.modalidadTrabajo,
  );
  const hasCustomModalidad =
    Boolean(form.values.modalidadTrabajo) &&
    !MODALIDAD_TRABAJO_OPTIONS.some((option) => option.value === form.values.modalidadTrabajo);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void onSubmit();
  };

  return (
    <form id="titular-vacante-form" className={styles.formBody} onSubmit={handleSubmit}>
      {form.areaLabel ? (
        <VacanteContextBanner areaLabel={form.areaLabel} hint={areaContextHint} />
      ) : null}

      <section className={styles.formPanel} aria-label="Información de la vacante">
        <h3 className={styles.formPanelTitle}>Información general</h3>
        <div className={styles.formGrid}>
          <div className={styles.formGridFull}>
            <TextInput
              id="vacante-nombre"
              label="Nombre de la vacante"
              value={form.values.nombre}
              required
              error={form.fieldErrors.nombre}
              onChange={(event) => form.updateField("nombre", event.target.value)}
            />
          </div>

          <div className={styles.formGridFull}>
            <FormField
              id="vacante-descripcion"
              label="Descripción"
              required
              error={form.fieldErrors.descripcion}
            >
              <textarea
                id="vacante-descripcion"
                className={formStyles.textarea}
                rows={3}
                value={form.values.descripcion}
                onChange={(event) => form.updateField("descripcion", event.target.value)}
                aria-invalid={Boolean(form.fieldErrors.descripcion)}
              />
            </FormField>
          </div>

          <div className={styles.formGridFull}>
            <TextInput
              id="vacante-perfil"
              label="Perfil requerido"
              hint="Carreras, habilidades o experiencia esperada."
              value={form.values.perfilRequerido}
              error={form.fieldErrors.perfilRequerido}
              onChange={(event) => form.updateField("perfilRequerido", event.target.value)}
            />
          </div>
        </div>
      </section>

      <section className={styles.formPanel} aria-label="Condiciones de la vacante">
        <h3 className={styles.formPanelTitle}>Condiciones</h3>
        <div className={styles.formGrid}>
          <div className={styles.formGridFull}>
            <SelectInput
              id="vacante-tipo"
              label="Tipo de vacante"
              required
              placeholder="Selecciona el tipo"
              hint="Servicio social, prácticas profesionales o residencias profesionales."
              value={form.values.modalidadId}
              error={form.fieldErrors.modalidadId}
              onChange={(event) => form.updateField("modalidadId", event.target.value)}
            >
              {MODALIDAD_CATALOGO_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </SelectInput>
          </div>

          <div className={styles.formGridFull}>
            <SelectInput
              id="vacante-modalidad-trabajo"
              label="Modalidad de trabajo"
              required
              placeholder="Selecciona una modalidad"
              value={form.values.modalidadTrabajo}
              error={form.fieldErrors.modalidadTrabajo}
              hint={selectedModalidad?.hint}
              onChange={(event) => form.updateField("modalidadTrabajo", event.target.value)}
            >
              {hasCustomModalidad ? (
                <option value={form.values.modalidadTrabajo}>{form.values.modalidadTrabajo}</option>
              ) : null}
              {MODALIDAD_TRABAJO_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </SelectInput>
          </div>
        </div>

        <div className={styles.conditionsGrid}>
          <TextInput
            id="vacante-cupo"
            label="Cupo total"
            type="number"
            min={1}
            required
            value={form.values.cupoTotal}
            error={form.fieldErrors.cupoTotal}
            onChange={(event) => form.updateField("cupoTotal", event.target.value)}
          />

          <div className={styles.examenField}>
            <p className={styles.examenLabel}>Proceso de ingreso</p>
            <CheckboxField
              id="vacante-requiere-examen"
              label="Requiere examen de ingreso"
              checked={form.values.requiereExamen}
              onChange={(checked) => form.updateField("requiereExamen", checked)}
            />
          </div>
        </div>

        {form.values.requiereExamen ? (
          <div className={styles.examenPanel}>
            <p className={styles.examenPanelTitle}>Examen de ingreso</p>
            <p className={styles.examenPanelHint}>
              Selecciona el examen diagnóstico que deberán contestar los postulantes.
            </p>

            {form.isLoadingExamenes ? (
              <p className={styles.examenLoading} role="status">
                Cargando exámenes activos de tu área…
              </p>
            ) : form.examenesActivos.length > 0 ? (
              <SelectInput
                id="vacante-examen-id"
                label="Examen relacionado"
                required
                placeholder="Selecciona un examen"
                hint="Solo se listan exámenes activos de tu área."
                value={form.selectedExamenId}
                error={form.examenError}
                disabled={form.isSubmitting}
                onChange={(event) => {
                  form.setSelectedExamenId(event.target.value);
                  form.setExamenError(undefined);
                }}
              >
                {form.examenesActivos.map((examen) => (
                  <option key={examen.idExamen} value={examen.idExamen}>
                    {examen.titulo}
                  </option>
                ))}
              </SelectInput>
            ) : form.examenesActivosTotales.length > 0 ? (
              <Alert tone="warning" title="Sin exámenes en tu área">
                Tienes exámenes activos, pero ninguno corresponde al área asignada de esta vacante.
                Verifica el área del examen o créalo en la sección <strong>Exámenes</strong>.
              </Alert>
            ) : (
              <Alert tone="info" title="Sin exámenes disponibles">
                No tienes exámenes activos. Créalos y actívalos en la sección{" "}
                <strong>Exámenes</strong> antes de vincularlos aquí.
              </Alert>
            )}
          </div>
        ) : null}
      </section>
    </form>
  );
}
