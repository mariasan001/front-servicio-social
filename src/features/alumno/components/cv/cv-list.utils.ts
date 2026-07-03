function cleanBulletLine(line: string) {
  return line.replace(/^[\s•·\-*]+/, "").trim();
}

function splitInlineBullets(value: string) {
  if (!value.includes("•") && !value.includes("·")) {
    return [cleanBulletLine(value)].filter(Boolean);
  }

  return value
    .split(/\s*[•·]\s*/)
    .map(cleanBulletLine)
    .filter(Boolean);
}

function splitByYearBoundaries(value: string) {
  const parts = value
    .split(/(?<=\d{4})\s+(?=[A-ZÁÉÍÓÚÑ])/)
    .map((part) => part.trim())
    .filter(Boolean);

  return parts.length > 1 ? parts : [value.trim()].filter(Boolean);
}

function normalizeItems(items: string[]) {
  const normalized = items.map((item) => item.trim()).filter(Boolean);
  return normalized.length > 0 ? normalized : [""];
}

export function parseListItems(text: string): string[] {
  const raw = text.trim();
  if (!raw) {
    return [""];
  }

  const items = raw
    .split(/\n\s*\n+/)
    .flatMap((block) => block.split(/\n+/))
    .flatMap((line) => splitInlineBullets(line))
    .map(cleanBulletLine)
    .filter(Boolean);

  if (items.length === 1) {
    const yearSplit = splitByYearBoundaries(items[0] ?? "");
    if (yearSplit.length > 1) {
      return normalizeItems(yearSplit);
    }
  }

  return normalizeItems(items);
}

export function serializeListItems(items: string[]): string {
  return items
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => `• ${item}`)
    .join("\n");
}
