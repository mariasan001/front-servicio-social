import { matchesDomainCode, normalizeDomainCode } from "./status";

export const MAX_HORAS_ALUMNO_POR_DIA = 12;

/** Alumno: qué puede corregir en un registro observado o en revisión. */
export const HORA_CORRECCION_SOLO_ACTIVIDADES_ALUMNO =
  "Solo puedes corregir las actividades realizadas. El horario de entrada y salida no se puede modificar.";

/** Delegación: alcance de la corrección al observar un registro de horas. */
export const HORA_OBSERVAR_SOLO_ACTIVIDADES_DELEGACION =
  "Si observas el registro, el alumno solo podrá corregir las actividades realizadas; no podrá modificar el horario.";

export function calcularHorasEntre(horaEntrada: string, horaSalida: string) {
  const entrada = timeToMinutes(horaEntrada);
  const salida = timeToMinutes(horaSalida);

  if (entrada === null || salida === null) {
    return null;
  }

  if (salida <= entrada) {
    return null;
  }

  return (salida - entrada) / 60;
}

function timeToMinutes(hora: string) {
  const match = /^(\d{2}):(\d{2})$/.exec(hora.trim());
  if (!match) {
    return null;
  }

  return Number(match[1]) * 60 + Number(match[2]);
}

function currentTimeMinutes(now = new Date()) {
  return now.getHours() * 60 + now.getMinutes();
}

/** Hora local actual en formato HH:mm (para `max` en inputs type="time"). */
export function formatHoraActual(now = new Date()) {
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

function parseFechaLocal(fecha: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(fecha.trim());
  if (!match) {
    return null;
  }

  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return Number.isNaN(date.getTime()) ? null : date;
}

export function isFechaRegistroHoy(fecha?: string, now = new Date()) {
  const parsed = fecha?.trim() ? parseFechaLocal(fecha) : null;
  if (!parsed) {
    return false;
  }

  return (
    parsed.getFullYear() === now.getFullYear() &&
    parsed.getMonth() === now.getMonth() &&
    parsed.getDate() === now.getDate()
  );
}

export function validarRegistroHoraAlumno(
  input: {
    fecha?: string;
    horaEntrada?: string;
    horaSalida?: string;
    descripcionActividades?: string;
  },
  now = new Date(),
) {
  if (!input.fecha?.trim() || !input.horaEntrada?.trim() || !input.horaSalida?.trim()) {
    return "Completa fecha, hora de entrada y hora de salida.";
  }

  if (!isFechaRegistroHoy(input.fecha, now)) {
    return "Solo puedes registrar horas del día de hoy.";
  }

  const descripcion = input.descripcionActividades?.trim() ?? "";
  if (!descripcion) {
    return "Describe las actividades realizadas.";
  }

  const horas = calcularHorasEntre(input.horaEntrada, input.horaSalida);
  if (horas === null) {
    return "La hora de salida debe ser posterior a la hora de entrada.";
  }

  if (horas > MAX_HORAS_ALUMNO_POR_DIA) {
    return `No puedes registrar más de ${MAX_HORAS_ALUMNO_POR_DIA} horas en un mismo día.`;
  }

  const ahoraMinutos = currentTimeMinutes(now);
  const entradaMinutos = timeToMinutes(input.horaEntrada);
  const salidaMinutos = timeToMinutes(input.horaSalida);

  if (entradaMinutos === null || salidaMinutos === null) {
    return "Completa fecha, hora de entrada y hora de salida.";
  }

  if (entradaMinutos > ahoraMinutos) {
    return "La hora de entrada no puede ser posterior a la hora actual.";
  }

  if (salidaMinutos > ahoraMinutos) {
    return "La hora de salida no puede ser posterior a la hora actual.";
  }

  return null;
}

export function isHoraPendienteRevision(estatus?: string) {
  return matchesDomainCode(estatus, "REGISTRADA", "OBSERVADA");
}

export function canValidateHora(estatus?: string) {
  return isHoraPendienteRevision(estatus);
}

export function canObserveHora(estatus?: string) {
  return isHoraPendienteRevision(estatus);
}

export function canRejectHora(estatus?: string) {
  return isHoraPendienteRevision(estatus);
}

export function canCancelHora(estatus?: string) {
  return normalizeDomainCode(estatus) !== "CANCELADA";
}
