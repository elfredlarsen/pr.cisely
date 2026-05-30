// Preview mode: client-side auth bypass for UI-only testing.
// Activates via URL ?preview=1 and persists in sessionStorage (per-tab).
// Server functions still require real auth — preview mode shows the UI
// shell with localStorage-based measurements and a hardcoded category list.

import { useEffect, useState } from "react";

const PREVIEW_KEY = "precisely.previewMode";
const PREVIEW_EVENT = "precisely:preview-mode-changed";

function readSession(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.sessionStorage.getItem(PREVIEW_KEY) === "1";
  } catch {
    return false;
  }
}

function writeSession(on: boolean) {
  if (typeof window === "undefined") return;
  try {
    if (on) window.sessionStorage.setItem(PREVIEW_KEY, "1");
    else window.sessionStorage.removeItem(PREVIEW_KEY);
    window.dispatchEvent(new Event(PREVIEW_EVENT));
  } catch {
    // ignore
  }
}

export function isPreviewMode(): boolean {
  if (typeof window === "undefined") return false;
  // Activate from URL on first read
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get("preview") === "1" && !readSession()) {
      writeSession(true);
    }
  } catch {
    // ignore
  }
  return readSession();
}

export function enablePreview() {
  writeSession(true);
}

export function disablePreview() {
  writeSession(false);
}

export function usePreviewMode(): boolean {
  const [on, setOn] = useState<boolean>(() => isPreviewMode());
  useEffect(() => {
    const handler = () => setOn(readSession());
    window.addEventListener(PREVIEW_EVENT, handler);
    window.addEventListener("storage", handler);
    // Re-check on mount in case URL param activated it
    setOn(isPreviewMode());
    return () => {
      window.removeEventListener(PREVIEW_EVENT, handler);
      window.removeEventListener("storage", handler);
    };
  }, []);
  return on;
}
