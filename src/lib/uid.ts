// src/lib/uid.ts
export function normalizeUID(raw: string) {
  return raw.toUpperCase().replace(/[^0-9A-F]/g, ""); // quita :, espacios, etc.
}
export function isValidUID(norm: string) {
  // UIDs comunes: 4 bytes (8 hex), 7 bytes (14 hex), 10 bytes (20 hex)
  return /^[0-9A-F]{8,20}$/.test(norm);
}
