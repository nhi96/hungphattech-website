"use client";

import { useEffect } from "react";

export function PreviewBridge() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a");
      if (!anchor) return;
      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) {
        event.preventDefault();
        return;
      }
      event.preventDefault();
      window.parent.postMessage(
        { type: "preview:navigate", path: url.pathname },
        window.location.origin,
      );
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return null;
}
