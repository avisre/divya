import type { MetadataRoute } from "next";
import { SITE_URL } from "../lib/env";
import { getLearnEntries, learnCategories } from "../lib/learn";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/learn",
    "/plans",
    "/prayers",
    "/temple",
    "/pujas",
    "/contact-us",
    "/privacy",
    "/terms",
    "/sitemap"
  ];

  const learnRoutes = [
    ...learnCategories.map((category) => `/learn/category/${category}`),
    ...getLearnEntries().map((entry) => `/learn/${entry.slug}`)
  ];

  return [...routes, ...learnRoutes].map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date()
  }));
}
