export const MAX_EXAMEN_SALIDAS = 3;

export function formatExamenRemaining(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export type ExamPhase = "loading" | "intro" | "in-progress" | "result" | "error";
