import type { StatusBadgeTone } from "@/shared/components/StatusBadge";

export type ReportPdfMetaItem = {
  label: string;
  value: string;
};

export const REPORT_PDF_BRAND = {
  vino: [107, 35, 64] as const,
  vinoDark: [74, 24, 41] as const,
  dorado: [184, 149, 106] as const,
  doradoLight: [228, 210, 184] as const,
  textPrimary: [45, 45, 45] as const,
  textSecondary: [92, 92, 92] as const,
  textMuted: [138, 138, 138] as const,
  textOnVino: [255, 255, 255] as const,
  textOnVinoMuted: [228, 210, 218] as const,
  border: [224, 224, 224] as const,
  white: [255, 255, 255] as const,
  zebra: [248, 248, 248] as const,
};

export const REPORT_PDF_LAYOUT = {
  margin: 14,
  headerBandHeight: 26,
  compactBandHeight: 11,
  footerHeight: 10,
};

export const REPORT_PDF_TONE_STYLES: Record<
  StatusBadgeTone,
  {
    fill: [number, number, number];
    text: [number, number, number];
  }
> = {
  success: { fill: [236, 244, 239], text: [47, 107, 82] },
  warning: { fill: [252, 244, 231], text: [154, 114, 52] },
  info: { fill: [234, 242, 250], text: [59, 110, 165] },
  error: { fill: [248, 236, 240], text: [107, 35, 64] },
  neutral: { fill: [245, 245, 245], text: [110, 110, 110] },
};

export function toRgb(color: readonly [number, number, number]): [number, number, number] {
  return [color[0], color[1], color[2]];
}
