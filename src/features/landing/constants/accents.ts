export const LANDING_ACCENTS = ["dorado", "vino-dark", "vino"] as const;

export type LandingAccent = (typeof LANDING_ACCENTS)[number];

export function getLandingAccent(index: number): LandingAccent {
  return LANDING_ACCENTS[index % LANDING_ACCENTS.length];
}
