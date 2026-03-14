"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { GA_MEASUREMENT_ID, trackPageView } from "../../lib/analytics";

export function GoogleAnalytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialPageViewHandled = useRef(false);

  useEffect(() => {
    if (!GA_MEASUREMENT_ID) {
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

  if (!GA_MEASUREMENT_ID) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}');
        `}
      </Script>
    </>
  );
}
