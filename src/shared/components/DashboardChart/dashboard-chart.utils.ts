export const DONUT_RADIUS = 58;
export const DONUT_STROKE = 18;
export const DONUT_CIRCUMFERENCE = 2 * Math.PI * DONUT_RADIUS;

export type DonutArc = {
  color: string;
  length: number;
  rotation: number;
  delay: number;
};

export function percent(value: number, total: number) {
  if (total <= 0) {
    return 0;
  }

  return Math.round((value / total) * 100);
}

export function buildDonutArcs(values: { value: number; color: string }[]): DonutArc[] {
  const total = values.reduce((sum, item) => sum + item.value, 0);
  let rotation = -90;

  return values
    .map((item, index) => {
      const length = total > 0 ? (item.value / total) * DONUT_CIRCUMFERENCE : 0;
      const arc = {
        color: item.color,
        length,
        rotation,
        delay: 0.12 + index * 0.22,
      };

      rotation += (length / DONUT_CIRCUMFERENCE) * 360;

      return arc;
    })
    .filter((arc) => arc.length > 0.5);
}
