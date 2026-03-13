import type { MetadataRoute } from "next";
import { SITE_URL } from "../lib/env";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/login",
    "/register",
    "/prayers",
    "/temple",
    "/pujas",
    "/calendar",
    "/contact-us",
    "/privacy",
    "/terms",
    "/sitemap",
    "/home",
    "/bookings",
    "/profile",
    "/contact",
    "/shared-prayer/create"
  ];

  return routes.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date()
  }));
}
