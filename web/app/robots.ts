import type { MetadataRoute } from "next";
import { SITE_URL } from "../lib/env";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/plans", "/prayers", "/temple", "/pujas", "/contact-us", "/privacy", "/terms", "/sitemap"],
        disallow: [
          "/login",
          "/register",
          "/forgot-password",
          "/reset-password",
          "/onboarding",
          "/home",
          "/bookings",
          "/profile",
          "/contact",
          "/shared-prayer",
          "/sessions",
          "/videos"
        ]
      }
    ],
    sitemap: `${SITE_URL}/sitemap.xml`
  };
}
