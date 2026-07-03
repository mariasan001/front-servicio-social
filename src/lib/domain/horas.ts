import { matchesDomainCode, normalizeDomainCode } from "./status";

export const MAX_HORAS_ALUMNO_POR_DIA = 12;

export function calcularHorasEntre(horaEntrada: string, horaSalida: string) {
  const entrada = /^(\d{2}):(\d{2})$/.exec(horaEntrada);
  const salida = /^(\d{2}):(\d{2})$/.exec(horaSalida);

  if (!entrada || !salida) {
    return null;
  }

  const entradaMinutos = Number(entrada[1]) * 60 + Number(entrada[2]);
  const salidaMinutos = Number(salida[1]) * 60 + Number(salida[2]);

  if (salidaMinutos <= entradaMinutos) {
    return null;
  }

  return (salidaMinutos - entradaMinutos) / 60;
}

function parseFechaLocal(fecha: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(fecha.trim());
  if (!match) {
    return null;
  }

  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return Number.isNaN(date.getTime()) ? null : date;
}

export function isFechaRegistroHoy(fecha?: string) {
  const parsed = fecha?.trim() ? parseFechaLocal(fecha) : null;
  if (!parsed) {
    return false;
  }

  const today = new Date();
  return (
    parsed.getFullYear() === today.getFullYear() &&
    parsed.getMonth() === today.getMonth() &&
    parsed.getDate() === today.getDate()
  );
}

export function validarRegistroHoraAlumno(input: {
  fecha?: string;
  horaEntrada?: string;
  horaSalida?: string;
  descripcionActividades?: string;
}) {
  if (!input.fecha?.trim() || !input.horaEntrada?.trim() || !input.horaSalida?.trim()) {
    return "Completa fecha, hora de entrada y hora de salida.";
  }

  if (!isFechaRegistroHoy(input.fecha)) {
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
