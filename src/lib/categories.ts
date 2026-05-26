export type Category =
  | "straksafgoerelse"
  | "eu_ansoegning"
  | "biometri"
  | "biometri_inkl_ansoegning"
  | "tilbagerejsetilladelse"
  | "forkert_myndighed"
  | "andet";

export const CATEGORIES: { value: Category; label: string }[] = [
  { value: "straksafgoerelse", label: "Straksafgørelse" },
  { value: "eu_ansoegning", label: "EU-ansøgning modtaget" },
  { value: "biometri", label: "Biometri" },
  { value: "biometri_inkl_ansoegning", label: "Biometri inkl. indgivelse af ansøgning" },
  { value: "tilbagerejsetilladelse", label: "Tilbagerejsetilladelse" },
  { value: "forkert_myndighed", label: "Forkert myndighed" },
  { value: "andet", label: "Andet" },
];

export function categoryLabel(value: Category): string {
  return CATEGORIES.find((c) => c.value === value)?.label ?? value;
}

const LAST_CATEGORY_KEY = "precisely.lastCategory";

export function getLastCategory(): Category {
  if (typeof window === "undefined") return "straksafgoerelse";
  try {
    const v = window.localStorage.getItem(LAST_CATEGORY_KEY);
    if (v && CATEGORIES.some((c) => c.value === v)) return v as Category;
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
