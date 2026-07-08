/** Clave de sessionStorage para credenciales tras registro (uso único). */
export const POST_REGISTER_CREDENTIALS_KEY = "auth:postRegisterCredentials";

export type PostRegisterCredentials = {
  username: string;
  password: string;
};

export function savePostRegisterCredentials(credentials: PostRegisterCredentials) {
  sessionStorage.setItem(
    POST_REGISTER_CREDENTIALS_KEY,
    JSON.stringify(credentials),
  );
}

export function consumePostRegisterCredentials(): PostRegisterCredentials | null {
  const raw = sessionStorage.getItem(POST_REGISTER_CREDENTIALS_KEY);
  sessionStorage.removeItem(POST_REGISTER_CREDENTIALS_KEY);

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as PostRegisterCredentials;
    if (parsed.username && parsed.password) {
      return parsed;
    }
  } catch {
    // Ignorar payload inválido.
  }

  return null;
}
