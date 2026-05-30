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

// Only allow preview mode when the page is embedded in the Lovable editor
// iframe. This prevents arbitrary internet visitors from bypassing the
// client-side auth guard by appending ?preview=1 to a public URL.
function isTrustedEmbed(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (window.self === window.top) return false;
    const ref = document.referrer;
    if (!ref) return false;
    const host = new URL(ref).hostname;
    return (
      host === "lovable.dev" ||
      host.endsWith(".lovable.dev") ||
      host.endsWith(".lovable.app") ||
      host.endsWith(".lovableproject.com")
    );
  } catch {
    return false;
  }
}

export function isPreviewMode(): boolean {
  if (typeof window === "undefined") return false;
  // Activate from URL on first read, but only inside a trusted editor embed
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get("preview") === "1" && !readSession() && isTrustedEmbed()) {
      writeSession(true);
    }
  } catch {
    // ignore
  }
  return readSession() && isTrustedEmbed();
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
