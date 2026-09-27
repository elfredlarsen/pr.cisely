// Hver bruger har sine egne kategorier i databasen.
//
// Listen af kategorier hentes via useCategories() / useCategoryLabel() hooks.

export type Category = string;

export function isValidCategory(value: unknown): value is Category {
  return typeof value === "string" && value.length > 0;
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
