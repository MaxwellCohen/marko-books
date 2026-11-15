import { thumbHashToDataURL } from "thumbhash";

/** Decodes a base64 thumbhash into a tiny PNG data URL (rendered on the server). */
export function thumbhashUrl(hash: string | null): string | undefined {
  if (!hash) return undefined;
  try {
    return thumbHashToDataURL(Uint8Array.from(atob(hash), (char) => char.charCodeAt(0)));
  } catch {
    return undefined;
  }
}
