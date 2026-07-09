import { it } from "vitest";

export function describeCases<T extends { name: string }>(
  cases: T[],
  run: (row: Omit<T, "name">) => void,
) {
  cases.forEach(({ name, ...row }) => {
    it(name, () => run(row as Omit<T, "name">));
  });
}
