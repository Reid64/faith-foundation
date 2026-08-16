"use client";

import { useEffect, useState } from "react";
import { BTN_SECONDARY } from "../../_components/theme";

/** Opens the browser print dialog. Disabled until hydrated, like every other
 *  button in the admin — a pre-hydration click would do nothing at all. */
export function PrintButton() {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  return (
    <button
      type="button"
      disabled={!ready}
      onClick={() => window.print()}
      className={`${BTN_SECONDARY} print:hidden`}
    >
      Print
    </button>
  );
}
