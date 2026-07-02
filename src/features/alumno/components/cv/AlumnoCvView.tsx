"use client";

import { usePanelRouter } from "@/features/panel/hooks/usePanelRouter";
import { type FormEvent, useState } from "react";
import { updateCvAction } from "../../actions/cv.actions";
import type { CvResponse } from "../../types/alumno.types";
import { Alert } from "@/shared/components/Alert";
import { Button } from "@/shared/components/Button";
import { FormField } from "@/shared/components/Form";
import formStyles from "@/shared/components/Form/Form.module.css";
import { PageHeader } from "@/shared/components/PageHeader";
import { StatusBadge } from "@/shared/components/StatusBadge";
import styles from "@/shared/styles/PanelDetailView.module.css";

type AlumnoCvViewProps = {
  cv: CvResponse;
};

export function AlumnoCvView({ cv }: AlumnoCvViewProps) {
  const router = usePanelRouter();
  const [form, setForm] = useState({
    perfilProfesional: cv.perfilProfesional ?? "",
    experienciaLaboral: cv.experienciaLaboral ?? "",
    habilidades: cv.habilidades ?? "",
    idiomas: cv.idiomas ?? "",
    certificaciones: cv.certificaciones ?? "",
    portafolioUrl: cv.portafolioUrl ?? "",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setSuccess(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    const result = await updateCvAction({
      perfilProfesional: form.perfilProfesional.trim() || undefined,
      experienciaLaboral: form.experienciaLaboral.trim() || undefined,
      habilidades: form.habilidades.trim() || undefined,
      idiomas: form.idiomas.trim() || undefined,
      certificaciones: form.certificaciones.trim() || undefined,
      portafolioUrl: form.portafolioUrl.trim() || undefined,
    });
    setIsSaving(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    setSuccess("Tu CV se actualizó correctamente.");
    router.refresh();
  };

  return (
    <section className={styles.page} aria-labelledby="alumno-cv-title">
      <PageHeader
        titleId="alumno-cv-title"
        title="Mi CV"
        description="Mantén actualizada tu información profesional para tus postulaciones."
      />

      <div className={styles.detailLayout}>
        <StatusBadge tone={cv.completo ? "success" : "warning"}>
          {cv.completo ? "CV completo" : "CV incompleto"}
        </StatusBadge>

        {!cv.completo && (cv.camposFaltantes?.length ?? 0) > 0 ? (
          <p className={styles.detailLead}>
            Campos pendientes: {cv.camposFaltantes?.join(", ")}
          </p>
        ) : null}

        {error ? <Alert tone="error">{error}</Alert> : null}
        {success ? <Alert tone="success">{success}</Alert> : null}

        <form className={styles.detailLayout} onSubmit={(event) => void handleSubmit(event)}>
          <div className={styles.formGrid}>
            <div className={styles.formGridFull}>
              <FormField id="perfil-profesional" label="Perfil profesional">
                <textarea
                  id="perfil-profesional"
                  className={formStyles.textarea}
                  rows={4}
                  value={form.perfilProfesional}
                  onChange={(event) => updateField("perfilProfesional", event.target.value)}
                />
              </FormField>
            </div>
            <div className={styles.formGridFull}>
              <FormField id="experiencia-laboral" label="Experiencia laboral">
                <textarea
                  id="experiencia-laboral"
                  className={formStyles.textarea}
                  rows={4}
                  value={form.experienciaLaboral}
                  onChange={(event) => updateField("experienciaLaboral", event.target.value)}
                />
              </FormField>
            </div>
            <div className={styles.formGridFull}>
              <FormField id="habilidades" label="Habilidades">
                <textarea
                  id="habilidades"
                  className={formStyles.textarea}
                  rows={3}
                  value={form.habilidades}
                  onChange={(event) => updateField("habilidades", event.target.value)}
                />
              </FormField>
            </div>
            <FormField id="idiomas" label="Idiomas">
              <textarea
                id="idiomas"
                className={formStyles.textarea}
                rows={2}
                value={form.idiomas}
                onChange={(event) => updateField("idiomas", event.target.value)}
              />
            </FormField>
            <FormField id="certificaciones" label="Certificaciones">
              <textarea
                id="certificaciones"
                className={formStyles.textarea}
                rows={2}
                value={form.certificaciones}
                onChange={(event) => updateField("certificaciones", event.target.value)}
              />
            </FormField>
            <div className={styles.formGridFull}>
              <FormField id="portafolio-url" label="URL de portafolio">
                <input
                  id="portafolio-url"
                  className={formStyles.input}
                  type="url"
                  value={form.portafolioUrl}
                  onChange={(event) => updateField("portafolioUrl", event.target.value)}
                  placeholder="https://"
                />
              </FormField>
            </div>
          </div>
          <div className={styles.detailActions}>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Guardando…" : "Guardar CV"}
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}
