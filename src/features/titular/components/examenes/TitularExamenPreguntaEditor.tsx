"use client";

import { useState, type FormEvent } from "react";
import { ListChecks, Plus, Trash2 } from "lucide-react";
import { PREGUNTA_TIPO, PREGUNTA_TIPO_OPTIONS } from "@/lib/domain";
import type {
  ExamenPreguntaRequest,
  ExamenPreguntaResponse,
} from "../../types/titular.types";
import { notify } from "@/shared/notifications";
import { Button } from "@/shared/components/Button";
import { FormField, SelectInput, TextInput } from "@/shared/components/Form";
import formStyles from "@/shared/components/Form/Form.module.css";
import styles from "./TitularExamen.module.css";

type OpcionDraft = {
  key: string;
  texto: string;
  correcta: boolean;
};

type PreguntaEditorProps = {
  pregunta?: ExamenPreguntaResponse | null;
  isSubmitting: boolean;
  onSubmit: (request: ExamenPreguntaRequest) => void;
  onCancel: () => void;
};

let opcionCounter = 0;
function nextKey() {
  opcionCounter += 1;
  return `opcion-${opcionCounter}`;
}

function verdaderoFalsoOpciones(correctaTexto?: string): OpcionDraft[] {
  const normalized = correctaTexto?.trim().toUpperCase();
  return [
    { key: nextKey(), texto: "Verdadero", correcta: normalized === "VERDADERO" },
    { key: nextKey(), texto: "Falso", correcta: normalized === "FALSO" },
  ];
}

function buildInitialOpciones(
  tipo: string,
  pregunta?: ExamenPreguntaResponse | null,
): OpcionDraft[] {
  if (tipo === PREGUNTA_TIPO.VERDADERO_FALSO) {
    const correcta = pregunta?.opciones?.find((opcion) => opcion.correcta);
    return verdaderoFalsoOpciones(correcta?.texto);
  }

  if (pregunta?.opciones?.length) {
    return pregunta.opciones.map((opcion) => ({
      key: nextKey(),
      texto: opcion.texto ?? "",
      correcta: Boolean(opcion.correcta),
    }));
  }

  return [
    { key: nextKey(), texto: "", correcta: true },
    { key: nextKey(), texto: "", correcta: false },
  ];
}

export function TitularExamenPreguntaEditor({
  pregunta,
  isSubmitting,
  onSubmit,
  onCancel,
}: PreguntaEditorProps) {
  const initialTipo = pregunta?.tipo?.trim() || PREGUNTA_TIPO.OPCION_UNICA;
  const [tipo, setTipo] = useState<string>(initialTipo);
  const [texto, setTexto] = useState(pregunta?.texto ?? "");
  const [puntaje, setPuntaje] = useState(String(pregunta?.puntaje ?? "1"));
  const [opciones, setOpciones] = useState<OpcionDraft[]>(() =>
    buildInitialOpciones(initialTipo, pregunta),
  );

  const isVerdaderoFalso = tipo === PREGUNTA_TIPO.VERDADERO_FALSO;

  const handleTipoChange = (nextTipo: string) => {
    setTipo(nextTipo);
    setOpciones(buildInitialOpciones(nextTipo, nextTipo === initialTipo ? pregunta : null));
  };

  const updateOpcionTexto = (key: string, value: string) => {
    setOpciones((current) =>
      current.map((opcion) =>
        opcion.key === key ? { ...opcion, texto: value } : opcion,
      ),
    );
  };

  const markCorrecta = (key: string) => {
    setOpciones((current) =>
      current.map((opcion) => ({
        ...opcion,
        correcta: opcion.key === key,
      })),
    );
  };

  const addOpcion = () => {
    setOpciones((current) => [
      ...current,
      { key: nextKey(), texto: "", correcta: false },
    ]);
  };

  const removeOpcion = (key: string) => {
    setOpciones((current) => {
      if (current.length <= 2) {
        return current;
      }
      const next = current.filter((opcion) => opcion.key !== key);
      if (!next.some((opcion) => opcion.correcta) && next[0]) {
        next[0] = { ...next[0], correcta: true };
      }
      return next;
    });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const textoTrim = texto.trim();
    if (!textoTrim) {
      notify.error("Escribe el texto de la pregunta.");
      return;
    }

    const puntajeValue = Number(puntaje);
    if (Number.isNaN(puntajeValue) || puntajeValue <= 0) {
      notify.error("Indica un puntaje válido (mayor a 0).");
      return;
    }

    const opcionesLimpias = opciones
      .map((opcion) => ({ texto: opcion.texto.trim(), correcta: opcion.correcta }))
      .filter((opcion) => opcion.texto.length > 0);

    if (opcionesLimpias.length < 2) {
      notify.error("Agrega al menos dos opciones con texto.");
      return;
    }

    const correctas = opcionesLimpias.filter((opcion) => opcion.correcta).length;
    if (correctas !== 1) {
      notify.error("Marca exactamente una opción como correcta.");
      return;
    }

    onSubmit({
      tipo,
      texto: textoTrim,
      puntaje: puntajeValue,
      opciones: opcionesLimpias,
    });
  };

  return (
    <form className={styles.preguntaEditor} onSubmit={handleSubmit}>
      <p className={styles.preguntaEditorHeader}>
        <ListChecks size={16} aria-hidden="true" />
        {pregunta ? "Editar pregunta" : "Nueva pregunta"}
      </p>
      <div className={styles.formGridTwo}>
        <SelectInput
          id="pregunta-tipo"
          label="Tipo de pregunta"
          value={tipo}
          onChange={(event) => handleTipoChange(event.target.value)}
        >
          {PREGUNTA_TIPO_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </SelectInput>
        <TextInput
          id="pregunta-puntaje"
          label="Puntaje"
          type="number"
          min={1}
          value={puntaje}
          onChange={(event) => setPuntaje(event.target.value)}
        />
      </div>

      <FormField id="pregunta-texto" label="Pregunta" required>
        <textarea
          id="pregunta-texto"
          className={formStyles.textarea}
          rows={2}
          value={texto}
          onChange={(event) => setTexto(event.target.value)}
        />
      </FormField>

      <div className={styles.opcionesBlock}>
        <p className={styles.opcionesLabel}>
          Opciones <span aria-hidden="true">·</span> marca la correcta
        </p>
        <ul className={styles.opcionesList}>
          {opciones.map((opcion) => (
            <li
              key={opcion.key}
              className={[
                styles.opcionRow,
                opcion.correcta ? styles.opcionRowCorrecta : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <input
                type="radio"
                name="opcion-correcta"
                className={styles.opcionRadio}
                checked={opcion.correcta}
                aria-label="Marcar como correcta"
                onChange={() => markCorrecta(opcion.key)}
              />
              <input
                type="text"
                className={styles.opcionInput}
                value={opcion.texto}
                placeholder="Texto de la opción"
                readOnly={isVerdaderoFalso}
                onChange={(event) =>
                  updateOpcionTexto(opcion.key, event.target.value)
                }
              />
              {!isVerdaderoFalso && opciones.length > 2 ? (
                <button
                  type="button"
                  className={styles.opcionRemove}
                  aria-label="Quitar opción"
                  onClick={() => removeOpcion(opcion.key)}
                >
                  <Trash2 size={15} aria-hidden="true" />
                </button>
              ) : null}
            </li>
          ))}
        </ul>

        {!isVerdaderoFalso ? (
          <button
            type="button"
            className={styles.opcionAdd}
            onClick={addOpcion}
          >
            <Plus size={15} aria-hidden="true" />
            Agregar opción
          </button>
        ) : null}
      </div>

      <div className={styles.preguntaEditorFooter}>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? "Guardando…" : pregunta ? "Guardar pregunta" : "Agregar pregunta"}
        </Button>
      </div>
    </form>
  );
}
