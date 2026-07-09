type VacanteExamenCacheEntry = {
  idExamen: number;
  titulo: string;
  updatedAt: string;
};

const STORAGE_KEY = "titular-vacante-examen-v1";

function readCache(): Record<string, VacanteExamenCacheEntry> {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, VacanteExamenCacheEntry>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeCache(cache: Record<string, VacanteExamenCacheEntry>) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
}

export function readVacanteExamenCache(idVacante: number) {
  const entry = readCache()[String(idVacante)];
  if (!entry?.idExamen || !entry.titulo?.trim()) {
    return null;
  }

  return entry;
}

export function saveVacanteExamenCache(
  idVacante: number,
  examen: Pick<VacanteExamenCacheEntry, "idExamen" | "titulo">,
) {
  const cache = readCache();
  cache[String(idVacante)] = {
    idExamen: examen.idExamen,
    titulo: examen.titulo.trim(),
    updatedAt: new Date().toISOString(),
  };
  writeCache(cache);
}

export function clearVacanteExamenCache(idVacante: number) {
  const cache = readCache();
  delete cache[String(idVacante)];
  writeCache(cache);
}
