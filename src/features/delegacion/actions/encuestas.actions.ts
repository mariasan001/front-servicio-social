"use server";

import { USER_ROLES } from "@/lib/auth/constants";

import { revalidatePath } from "next/cache";
import { runAuthorizedAction, type ActionResult } from "@/lib/actions";
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
  return runAuthorizedAction([USER_ROLES.DELEGACION], 
    () => listEncuestasSatisfaccion({ page: 0, size: 100 }),
    "No pudimos cargar las encuestas de satisfacción.",
  );
}

export async function ocultarEncuestaSatisfaccionAction(
  idEncuesta: number,
): Promise<ActionResult<EncuestaSatisfaccionResponse>> {
  const result = await runAuthorizedAction([USER_ROLES.DELEGACION],
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
  const result = await runAuthorizedAction([USER_ROLES.DELEGACION],
    () => publicarEncuestaSatisfaccion(idEncuesta),
    "No pudimos publicar la encuesta.",
  );

  if (result.success) {
    revalidateDelegacionSection("encuestas");
    revalidatePath("/");
  }

  return result;
}
