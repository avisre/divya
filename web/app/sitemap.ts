import type { MetadataRoute } from "next";
import { SITE_URL } from "../lib/env";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/prayers",
    "/temple",
    "/pujas",
    "/contact-us",
    "/privacy",
    "/terms",
    "/sitemap"
  ];

  return routes.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date()
  }));
}
