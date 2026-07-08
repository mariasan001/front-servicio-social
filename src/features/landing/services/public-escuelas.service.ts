import { publicApiGet } from "@/lib/api/public-request";
import type { PublicInstitucionRegistradaResponse } from "../types/public-escuela.types";

export async function listPublicInstitucionesRegistradas() {
  return publicApiGet<PublicInstitucionRegistradaResponse[]>(
    "/api/public/instituciones/registradas",
  );
}
