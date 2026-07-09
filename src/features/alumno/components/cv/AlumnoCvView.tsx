"use client";

import { usePanelRouter } from "@/features/panel/hooks/usePanelRouter";
import { useSearchParams } from "next/navigation";
import { type FormEvent, useMemo, useState } from "react";
import { updateCvAction } from "../../actions/cv.actions";
import { compactPayload } from "@/lib/actions/normalize-server-args";
import {
  ALUMNO_POSTULACION_ENTRY_PATH,
  hasAlumnoCvPostulacionMotivo,
} from "@/lib/auth/postulacion-entry";
import type { CvResponse } from "../../types/alumno.types";
import { notify } from "@/shared/notifications";
import { Alert } from "@/shared/components/Alert";
import { Button } from "@/shared/components/Button";
import { FormField, TextInput } from "@/shared/components/Form";
import formStyles from "@/shared/components/Form/Form.module.css";
import { PageGreeting } from "@/shared/components/PageHeader";
import { StatusBadge } from "@/shared/components/StatusBadge";
import pageStyles from "@/shared/styles/PanelSectionView.module.css";
import formLayoutStyles from "@/shared/styles/PanelFormModal.module.css";
import { CvEntryList } from "./CvEntryList";
import {
  countCvProgress,
  getMissingCvFields,
  type CvTrackedField,
} from "./cv-labels";
import {
  parseListItems,
  serializeListItems,
} from "./cv-list.utils";
import styles from "./AlumnoCvView.module.css";

type AlumnoCvViewProps = {
  cv: CvResponse;
  nombreCompleto: string;
};

type CvFormState = Record<CvTrackedField, string> & {
  portafolioUrl: string;
};

function buildInitialForm(cv: CvResponse): CvFormState {
  return {
    perfilProfesional: cv.perfilProfesional ?? "",
    experienciaLaboral: cv.experienciaLaboral ?? "",
    habilidades: cv.habilidades ?? "",
    idiomas: cv.idiomas ?? "",
    certificaciones: cv.certificaciones ?? "",
    portafolioUrl: cv.portafolioUrl ?? "",
  };
}

function buildCvSyncKey(cv: CvResponse) {
  return JSON.stringify([
    cv.perfilProfesional,
    cv.experienciaLaboral,
    cv.habilidades,
    cv.idiomas,
    cv.certificaciones,
    cv.portafolioUrl,
    cv.completo,
  ]);
}

export function AlumnoCvView({ cv, nombreCompleto }: AlumnoCvViewProps) {
  return (
    <AlumnoCvViewContent key={buildCvSyncKey(cv)} cv={cv} nombreCompleto={nombreCompleto} />
  );
}

function AlumnoCvViewContent({ cv, nombreCompleto }: AlumnoCvViewProps) {
  const router = usePanelRouter();
  const searchParams = useSearchParams();
  const motivoPostulacion = hasAlumnoCvPostulacionMotivo(searchParams.get("motivo"));
  const firstName =
    nombreCompleto.trim().split(/\s+/)[0]?.trim() || nombreCompleto.trim() || "alumno";
  const [form, setForm] = useState(() => buildInitialForm(cv));
  const [habilidadesItems, setHabilidadesItems] = useState(() =>
    parseListItems(cv.habilidades ?? ""),
  );
  const [experienciaItems, setExperienciaItems] = useState(() =>
    parseListItems(cv.experienciaLaboral ?? ""),
  );
  const [idiomasItems, setIdiomasItems] = useState(() => parseListItems(cv.idiomas ?? ""));
  const [certificacionesItems, setCertificacionesItems] = useState(() =>
    parseListItems(cv.certificaciones ?? ""),
  );
  const [isSaving, setIsSaving] = useState(false);

  const effectiveForm = useMemo<CvFormState>(
    () => ({
      ...form,
      habilidades: serializeListItems(habilidadesItems),
      experienciaLaboral: serializeListItems(experienciaItems),
      idiomas: serializeListItems(idiomasItems),
      certificaciones: serializeListItems(certificacionesItems),
    }),
    [form, habilidadesItems, experienciaItems, idiomasItems, certificacionesItems],
  );

  const isComplete = useMemo(
    () => countCvProgress(effectiveForm).requiredComplete,
    [effectiveForm],
  );
  const missingFields = useMemo(() => getMissingCvFields(effectiveForm), [effectiveForm]);
  const savedSnapshot = useMemo(() => buildInitialForm(cv), [cv]);
  const isDirty = useMemo(() => {
    const savedLists = {
      habilidades: savedSnapshot.habilidades,
      experienciaLaboral: savedSnapshot.experienciaLaboral,
      idiomas: savedSnapshot.idiomas,
      certificaciones: savedSnapshot.certificaciones,
    };
    const currentLists = {
      habilidades: effectiveForm.habilidades,
      experienciaLaboral: effectiveForm.experienciaLaboral,
      idiomas: effectiveForm.idiomas,
      certificaciones: effectiveForm.certificaciones,
    };

    return (
      effectiveForm.perfilProfesional !== savedSnapshot.perfilProfesional ||
      effectiveForm.portafolioUrl !== savedSnapshot.portafolioUrl ||
      JSON.stringify(currentLists) !== JSON.stringify(savedLists)
    );
  }, [effectiveForm, savedSnapshot]);

  const updateField = (field: keyof CvFormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const updateHabilidades = (items: string[]) => {
    setHabilidadesItems(items);
  };

  const updateExperiencia = (items: string[]) => {
    setExperienciaItems(items);
  };

  const updateIdiomas = (items: string[]) => {
    setIdiomasItems(items);
  };

  const updateCertificaciones = (items: string[]) => {
    setCertificacionesItems(items);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);

    const result = await updateCvAction(
      compactPayload({
        perfilProfesional: effectiveForm.perfilProfesional.trim() || undefined,
        experienciaLaboral: effectiveForm.experienciaLaboral.trim() || undefined,
        habilidades: effectiveForm.habilidades.trim() || undefined,
        idiomas: effectiveForm.idiomas.trim() || undefined,
        certificaciones: effectiveForm.certificaciones.trim() || undefined,
        portafolioUrl: effectiveForm.portafolioUrl.trim() || undefined,
      }),
    );

    setIsSaving(false);

    if (!result.success) {
      notify.error(result.error);
      return;
    }

    const savedComplete = countCvProgress(effectiveForm).requiredComplete;

    if (savedComplete && motivoPostulacion) {
      notify.success("Tu CV se guardó con éxito.", {
        description: "Ya puedes postularte a vacantes.",
      });
      router.push(ALUMNO_POSTULACION_ENTRY_PATH);
      return;
    }

    notify.success("Tu CV se actualizó correctamente.");
    router.refresh();
  };

  const handleDiscard = () => {
    setForm(savedSnapshot);
    setHabilidadesItems(parseListItems(savedSnapshot.habilidades));
    setExperienciaItems(parseListItems(savedSnapshot.experienciaLaboral));
    setIdiomasItems(parseListItems(savedSnapshot.idiomas));
    setCertificacionesItems(parseListItems(savedSnapshot.certificaciones));
  };

  return (
    <section className={pageStyles.page} aria-labelledby="alumno-cv-title">
      {motivoPostulacion ? (
        <Alert tone="warning" title="Completa tu CV para postularte">
          Antes de iniciar una postulación necesitas llenar y guardar tu CV con tu perfil
          profesional, experiencia y habilidades.
        </Alert>
      ) : null}

      <header className={styles.cvHeader}>
        <div className={styles.cvHeaderMain}>
          <div className={styles.cvHeaderCopy}>
            <h1 id="alumno-cv-title" className={styles.cvTitle}>
              <PageGreeting name={firstName} />
            </h1>
            <p className={styles.cvDescription}>
              {motivoPostulacion
                ? "Completa y guarda tu CV para desbloquear vacantes y poder postularte."
                : isComplete
                  ? "Actualiza tu perfil profesional. Las áreas lo consultan al revisar tus postulaciones."
                  : "Para empezar, completa y guarda tu CV. El resto del panel se activará cuando esté listo."}
            </p>
          </div>

          <StatusBadge
            tone={isComplete ? "success" : "warning"}
            icon={isComplete ? "done" : "review"}
          >
            {isComplete ? "CV completo" : "CV incompleto"}
          </StatusBadge>
        </div>

        {!isComplete && missingFields.length > 0 ? (
          <p className={styles.cvPending}>
            Te falta completar: {missingFields.join(", ")}.
          </p>
        ) : null}

        <hr className={styles.cvDivider} aria-hidden="true" />
      </header>

      <div className={styles.layout}>
        <article className={styles.formCard}>
          <form className={formLayoutStyles.formLayout} onSubmit={(event) => void handleSubmit(event)}>
            <section className={formLayoutStyles.formSection} aria-label="Perfil profesional">
              <p className={formLayoutStyles.formSectionTitle}>Perfil profesional</p>
              <div className={formLayoutStyles.formGrid}>
                <div className={formLayoutStyles.formGridFull}>
                  <FormField
                    id="perfil-profesional"
                    label="Resumen profesional"
                    hint="Formación, intereses y objetivo en servicio social o residencia."
                  >
                    <textarea
                      id="perfil-profesional"
                      className={formStyles.textarea}
                      rows={4}
                      value={form.perfilProfesional}
                      onChange={(event) => updateField("perfilProfesional", event.target.value)}
                    />
                  </FormField>
                </div>
              </div>
            </section>

            <section className={formLayoutStyles.formSection} aria-label="Experiencia y habilidades">
              <p className={formLayoutStyles.formSectionTitle}>Experiencia y habilidades</p>
              <div className={formLayoutStyles.formGrid}>
                <div className={formLayoutStyles.formGridFull}>
                  <FormField
                    id="experiencia-laboral"
                    label="Experiencia laboral"
                    hint="Agrega cada práctica, proyecto o empleo por separado."
                  >
                    <CvEntryList
                      idPrefix="experiencia-laboral"
                      items={experienciaItems}
                      onChange={updateExperiencia}
                      addLabel="Agregar experiencia"
                      placeholder="Ej: Auxiliar administrativo — Empresa X (2024)"
                      emptyHint="Aún no has agregado experiencia. Usa el botón para registrar la primera."
                    />
                  </FormField>
                </div>

                <div className={formLayoutStyles.formGridFull}>
                  <FormField
                    id="habilidades"
                    label="Habilidades"
                    hint="Escribe una habilidad por renglón y agrega más cuando lo necesites."
                  >
                    <CvEntryList
                      idPrefix="habilidad"
                      items={habilidadesItems}
                      onChange={updateHabilidades}
                      addLabel="Agregar habilidad"
                      placeholder="Ej: Trabajo en equipo"
                      emptyHint="Agrega al menos una habilidad para completar este apartado."
                    />
                  </FormField>
                </div>
              </div>
            </section>

            <section className={formLayoutStyles.formSection} aria-label="Información complementaria">
              <p className={formLayoutStyles.formSectionTitle}>Información complementaria</p>
              <div className={formLayoutStyles.formGrid}>
                <div className={formLayoutStyles.formGridFull}>
                  <FormField
                    id="idiomas"
                    label="Idiomas"
                    hint="Agrega un idioma por renglón con su nivel."
                  >
                    <CvEntryList
                      idPrefix="idioma"
                      items={idiomasItems}
                      onChange={updateIdiomas}
                      addLabel="Agregar idioma"
                      placeholder="Ej: Inglés intermedio (B1)"
                    />
                  </FormField>
                </div>

                <div className={formLayoutStyles.formGridFull}>
                  <FormField
                    id="certificaciones"
                    label="Certificaciones"
                    hint="Agrega cada curso o diploma por separado."
                  >
                    <CvEntryList
                      idPrefix="certificacion"
                      items={certificacionesItems}
                      onChange={updateCertificaciones}
                      addLabel="Agregar certificación"
                      placeholder="Ej: Excel intermedio — Udemy (2024)"
                    />
                  </FormField>
                </div>

                <div className={formLayoutStyles.formGridFull}>
                  <TextInput
                    id="portafolio-url"
                    label="URL de portafolio"
                    type="url"
                    hint="Opcional. Enlace a GitHub, Behance, sitio personal u otro portafolio."
                    placeholder="https://"
                    value={form.portafolioUrl}
                    onChange={(event) => updateField("portafolioUrl", event.target.value)}
                  />
                </div>
              </div>
            </section>

            <div className={styles.formFooter}>
              {isDirty ? (
                <Button type="button" variant="outline" disabled={isSaving} onClick={handleDiscard}>
                  Descartar
                </Button>
              ) : null}
              <Button type="submit" variant="success" disabled={isSaving || !isDirty}>
                {isSaving ? "Guardando…" : "Guardar cambios"}
              </Button>
            </div>
          </form>
        </article>
      </div>
    </section>
  );
}
