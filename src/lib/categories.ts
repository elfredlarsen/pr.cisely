// Kategorierne ligger i databasen og redigeres af administratorer.
// Denne fil indeholder typedefinitioner og lokale storage-helpers
// (sidste valgte kategori + per-bruger filter på "aktive" kategorier).
//
// Listen af kategorier hentes via useCategories() / useCategoryLabel() hooks.

export type Category = string;

export function isValidCategory(value: unknown): value is Category {
  return typeof value === "string" && value.length > 0;
}

const LAST_CATEGORY_KEY = "precisely.lastCategory";

export function getLastCategory(): Category | null {
  if (typeof window === "undefined") return null;
  try {
    const v = window.localStorage.getItem(LAST_CATEGORY_KEY);
    if (v && isValidCategory(v)) return v;
  } catch {
    // ignore
  }
  return null;
}

export function setLastCategory(value: Category) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LAST_CATEGORY_KEY, value);
  } catch {
    // ignore
  }
}

export const ACTIVE_CATEGORIES_KEY = "precisely.activeCategories";
export const ACTIVE_CATEGORIES_EVENT = "precisely:active-categories-changed";

/**
 * Returnerer per-bruger filter (lokal). `null` betyder "alle".
 */
export function getActiveCategoriesFilter(): Category[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(ACTIVE_CATEGORIES_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    const filtered = parsed.filter(isValidCategory) as Category[];
    return filtered.length > 0 ? filtered : null;
  } catch {
    return null;
  }
}

export function setActiveCategoriesFilter(values: Category[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(ACTIVE_CATEGORIES_KEY, JSON.stringify(values));
    window.dispatchEvent(new Event(ACTIVE_CATEGORIES_EVENT));
  } catch {
    // ignore
  }
}

// Bagudkompatibel fallback til komponenter der ikke har fået kategori-listen
// fra hooken endnu (fx ved første render). Indeholder samme værdier som
// seedet i databasen, så `categoryLabel(value)` altid har et fornuftigt fald-tilbage.
export const FALLBACK_CATEGORY_LABELS: Record<string, string> = {
  straksafgoerelse: "Straksafgørelse",
  arbejdstager: "Arbejdstager",
  tilstraekkelige_midler: "Tilstrækkelige midler",
  studerende: "Studerende",
  tidsubegraenset_ophold: "Tidsubegrænset ophold",
  eu_familiemedlem: "EU-familiemedlem",
  tredjelandsfamiliemedlem: "Tredjelandsfamiliemedlem",
  selvstaendig_erhvervsdrivende: "Selvstændig erhvervsdrivende",
  eu_vejledning: "EU-vejledning",
  et_g_sekundaer_bevaegelighed: "1G Sekundær bevægelighed",
  tub_sekundaer_bevaegelighed: "TUB Sekundær bevægelighed",
  biometri: "Biometri",
  andet: "Andet",
};

export function fallbackCategoryLabel(value: Category): string {
  return FALLBACK_CATEGORY_LABELS[value] ?? value;
}
