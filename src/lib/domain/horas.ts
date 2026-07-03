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

export function validarRegistroHoraAlumno(input: {
  fecha?: string;
  horaEntrada?: string;
  horaSalida?: string;
  descripcionActividades?: string;
}) {
  if (!input.fecha?.trim() || !input.horaEntrada?.trim() || !input.horaSalida?.trim()) {
    return "Completa fecha, hora de entrada y hora de salida.";
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
