export type Category =
  | "straksafgoerelse"
  | "arbejdstager"
  | "tilstraekkelige_midler"
  | "studerende"
  | "tidsubegraenset_ophold"
  | "eu_familiemedlem"
  | "tredjelandsfamiliemedlem"
  | "selvstaendig_erhvervsdrivende"
  | "eu_vejledning"
  | "et_g_sekundaer_bevaegelighed"
  | "tub_sekundaer_bevaegelighed"
  | "biometri"
  | "andet";

export const CATEGORIES: { value: Category; label: string }[] = [
  { value: "straksafgoerelse", label: "Straksafgørelse" },
  { value: "arbejdstager", label: "Arbejdstager" },
  { value: "tilstraekkelige_midler", label: "Tilstrækkelige midler" },
  { value: "studerende", label: "Studerende" },
  { value: "tidsubegraenset_ophold", label: "Tidsubegrænset ophold" },
  { value: "eu_familiemedlem", label: "EU-familiemedlem" },
  { value: "tredjelandsfamiliemedlem", label: "Tredjelandsfamiliemedlem" },
  { value: "selvstaendig_erhvervsdrivende", label: "Selvstændig erhvervsdrivende" },
  { value: "eu_vejledning", label: "EU-vejledning" },
  { value: "et_g_sekundaer_bevaegelighed", label: "1G Sekundær bevægelighed" },
  { value: "tub_sekundaer_bevaegelighed", label: "TUB Sekundær bevægelighed" },
  { value: "biometri", label: "Biometri" },
  { value: "andet", label: "Andet" },
];

export function categoryLabel(value: Category): string {
  return CATEGORIES.find((c) => c.value === value)?.label ?? value;
}

export function isValidCategory(value: unknown): value is Category {
  return typeof value === "string" && CATEGORIES.some((c) => c.value === value);
}

const LAST_CATEGORY_KEY = "precisely.lastCategory";

export function getLastCategory(): Category {
  if (typeof window === "undefined") return "straksafgoerelse";
  try {
    const v = window.localStorage.getItem(LAST_CATEGORY_KEY);
    if (v && isValidCategory(v)) return v;
  } catch {
    // ignore
  }
  return "straksafgoerelse";
}

export function setLastCategory(value: Category) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LAST_CATEGORY_KEY, value);
  } catch {
    // ignore
  }
}
