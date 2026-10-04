import { useCallback, useEffect, useState } from "react";

export type ThemeChoice = "light" | "dark" | "system";

const KEY = "precisely.theme";
const EVENT = "precisely-theme-change";

// Kører før første tegning, så siden ikke blinker lyst.
export const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem("${KEY}");var d=t==="dark"||(t!=="light"&&matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d);}catch(e){}})();`;

function readChoice(): ThemeChoice {
  const v = localStorage.getItem(KEY);
  return v === "light" || v === "dark" ? v : "system";
}

function apply(choice: ThemeChoice) {
  const dark =
    choice === "dark" ||
    (choice === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
}

/** Holder <html>-klassen i sync med valget og systemindstillingen. */
export function useThemeSync() {
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const update = () => apply(readChoice());
    update();
    mq.addEventListener("change", update);
    window.addEventListener(EVENT, update);
    window.addEventListener("storage", update);
    return () => {
      mq.removeEventListener("change", update);
      window.removeEventListener(EVENT, update);
      window.removeEventListener("storage", update);
    };
  }, []);
}

export function useTheme() {
  const [choice, setChoice] = useState<ThemeChoice>("system");
  useEffect(() => setChoice(readChoice()), []);
  const set = useCallback((c: ThemeChoice) => {
    if (c === "system") localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, c);
    setChoice(c);
    window.dispatchEvent(new Event(EVENT));
  }, []);
  return [choice, set] as const;
}
