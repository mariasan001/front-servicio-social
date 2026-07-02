const STORAGE_KEY = "servicio-social:escuela-invitaciones";

export type CachedInvitation = {
  idToken: number;
  token: string;
  urlRegistro?: string;
  fechaExpiracion?: string;
};

type CacheStore = Record<string, Record<string, CachedInvitation>>;

function readCache(): CacheStore {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CacheStore) : {};
  } catch {
    return {};
  }
}

function writeCache(cache: CacheStore) {
  if (typeof window === "undefined") {
    return;
  }

  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
}

export function cacheSchoolInvitation(escuelaId: number, data: CachedInvitation) {
  if (!data.token.trim()) {
    return;
  }

  const cache = readCache();
  const schoolKey = String(escuelaId);

  cache[schoolKey] = {
    ...cache[schoolKey],
    [String(data.idToken)]: data,
  };

  writeCache(cache);
}

export function getSchoolInvitation(
  escuelaId: number,
  idToken: number,
): CachedInvitation | null {
  return readCache()[String(escuelaId)]?.[String(idToken)] ?? null;
}

export function getCachedInvitationIds(escuelaId: number) {
  const schoolCache = readCache()[String(escuelaId)] ?? {};
  return Object.keys(schoolCache).map(Number);
}
