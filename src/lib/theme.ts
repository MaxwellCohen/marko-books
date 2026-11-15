export type Theme = "light" | "dark" | "system";

export const THEME_STORAGE_KEY = "theme";

export function isTheme(value: string | null): value is Theme {
  return value === "light" || value === "dark" || value === "system";
}

export function applyThemeClass(theme: Theme) {
  const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  document.documentElement.classList.toggle("dark", theme === "dark" || (theme === "system" && systemDark));
}

export function readStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return isTheme(stored) ? stored : "system";
  } catch {
    return "system";
  }
}

export function storeTheme(theme: Theme) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {}
}
