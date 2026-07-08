const STORAGE_KEY = "titular:vacante-examen:v1";

export type VacanteExamenCacheEntry = {
  idExamen: number;
  titulo: string;
};

type VacanteExamenCache = Record<string, VacanteExamenCacheEntry>;

function readCache(): VacanteExamenCache {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {};
    }
    return JSON.parse(raw) as VacanteExamenCache;
  } catch {
    return {};
  }
}

function writeCache(cache: VacanteExamenCache) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
}

export function getVacanteExamenCache(
  idVacante: number,
): VacanteExamenCacheEntry | null {
  const entry = readCache()[String(idVacante)];
  if (!entry?.idExamen || !entry.titulo?.trim()) {
    return null;
  }
  return entry;
}

export function setVacanteExamenCache(
  idVacante: number,
  entry: VacanteExamenCacheEntry,
) {
  const cache = readCache();
  cache[String(idVacante)] = entry;
  writeCache(cache);
}

export function clearVacanteExamenCache(idVacante: number) {
  const cache = readCache();
  delete cache[String(idVacante)];
  writeCache(cache);
}
