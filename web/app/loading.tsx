"use client";

import { useEffect, useState } from "react";

export default function Loading() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setVisible(true);
    }, 300);

    return () => window.clearTimeout(timer);
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <div className="app-loading-screen" role="status" aria-live="polite" aria-label="Loading Prarthana">
      <div className="app-loading-screen__spinner" aria-hidden="true" />
      <div className="app-loading-screen__copy">
        <strong>Loading Prarthana</strong>
        <span>Preparing your next page.</span>
      </div>
    </div>
  );
}
