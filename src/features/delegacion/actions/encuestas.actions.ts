"use server";

import { revalidatePath } from "next/cache";
import { runServerAction, type ActionResult } from "@/lib/actions";
import { revalidateDelegacionSection } from "../lib/revalidate-delegacion";
import {
  listEncuestasSatisfaccion,
  ocultarEncuestaSatisfaccion,
  publicarEncuestaSatisfaccion,
} from "../services/encuestas.service";
import type { EncuestaSatisfaccionResponse } from "../types/delegacion.types";

export async function listEncuestasSatisfaccionAction(): Promise<
  ActionResult<EncuestaSatisfaccionResponse[]>
> {
  return runServerAction(
    () => listEncuestasSatisfaccion({ page: 0, size: 100 }),
    "No pudimos cargar las encuestas de satisfacción.",
  );
}

export async function ocultarEncuestaSatisfaccionAction(
  idEncuesta: number,
): Promise<ActionResult<EncuestaSatisfaccionResponse>> {
  const result = await runServerAction(
    () => ocultarEncuestaSatisfaccion(idEncuesta),
    "No pudimos ocultar la encuesta.",
  );

  if (result.success) {
    revalidateDelegacionSection("encuestas");
    revalidatePath("/");
  }

  return result;
}

export async function publicarEncuestaSatisfaccionAction(
  idEncuesta: number,
): Promise<ActionResult<EncuestaSatisfaccionResponse>> {
  const result = await runServerAction(
    () => publicarEncuestaSatisfaccion(idEncuesta),
    "No pudimos publicar la encuesta.",
  );

  if (result.success) {
    revalidateDelegacionSection("encuestas");
    revalidatePath("/");
  }

  return result;
}
