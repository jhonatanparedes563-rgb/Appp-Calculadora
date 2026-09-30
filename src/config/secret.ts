/**
 * Configuración del código secreto de acceso a la bóveda privada.
 * Por defecto está configurado en "2580" (y reconoce "25").
 * El usuario puede ingresar el código y pulsar '=' para desbloquear.
 */
export const SECRET_CODE = "2580";

const SECRET_STORAGE_KEY = "calc_vault_secret_code";

export function getSecretCode(): string {
  if (typeof window === "undefined") return SECRET_CODE;
  const stored = localStorage.getItem(SECRET_STORAGE_KEY);
  return stored || SECRET_CODE;
}

export function setCustomSecretCode(newCode: string): boolean {
  if (!newCode || newCode.trim().length < 2) return false;
  localStorage.setItem(SECRET_STORAGE_KEY, newCode.trim());
  return true;
}

export function isSecretCode(input: string): boolean {
  const clean = input.trim();
  const activeCode = getSecretCode();
  // Reconoce el código activo, el código por defecto "2580" y el prefijo "25"
  return clean === activeCode || clean === SECRET_CODE || clean === "25" || clean === "2580";
}
