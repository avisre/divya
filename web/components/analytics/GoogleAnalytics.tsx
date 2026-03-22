"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { PLAUSIBLE_API_HOST, PLAUSIBLE_DOMAIN, trackPageView } from "../../lib/analytics";

export function GoogleAnalytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialPageViewHandled = useRef(false);

  useEffect(() => {
    if (!PLAUSIBLE_DOMAIN) {
      return;
    }

    if (!initialPageViewHandled.current) {
      initialPageViewHandled.current = true;
      return;
    }

    const query = searchParams.toString();
    const path = query ? `${pathname}?${query}` : pathname;
    trackPageView(path);
  }, [pathname, searchParams]);

  if (!PLAUSIBLE_DOMAIN) {
    return null;
  }

  return (
    <Script
      src={`${PLAUSIBLE_API_HOST}/js/script.js`}
      data-domain={PLAUSIBLE_DOMAIN}
      strategy="afterInteractive"
    />
  );
}
