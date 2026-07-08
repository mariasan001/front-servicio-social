import { publicApiGet } from "@/lib/api/public-request";
import type { PublicTestimonioResponse } from "../types/public-testimonial.types";

export async function listPublicTestimonios() {
  return publicApiGet<PublicTestimonioResponse[]>("/api/public/testimonios");
}
