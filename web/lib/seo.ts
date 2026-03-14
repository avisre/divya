import type { Metadata } from "next";
import { SITE_URL } from "./env";

type PageMetadataInput = {
  title: string;
  description: string;
  path?: string;
  imagePath?: string;
};

function absoluteUrl(path = "/") {
  return new URL(path, SITE_URL).toString();
}

function previewImages(imagePath?: string) {
  if (!imagePath) return undefined;
  return [
    {
      url: absoluteUrl(imagePath)
    }
  ];
}

export function buildPublicMetadata({
  title,
  description,
  path = "/",
  imagePath = "/images/bhadra-bhagavathi-temple-fallback.svg"
}: PageMetadataInput): Metadata {
  const url = absoluteUrl(path);
  const images = previewImages(imagePath);

  return {
    title,
    description,
    alternates: {
      canonical: url
    },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      images
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: images?.map((image) => image.url)
    }
  };
}

export function buildPrivateMetadata({
  title,
  description
}: Omit<PageMetadataInput, "path" | "imagePath">): Metadata {
  return {
    title,
    description,
    robots: {
      index: false,
      follow: false,
      googleBot: {
        index: false,
        follow: false,
        noimageindex: true
      }
    }
  };
}

export function buildBreadcrumbSchema(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path)
    }))
  };
}

export function buildOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "ReligiousOrganization",
    name: "Prarthana",
    url: SITE_URL,
    description:
      "A devotional web platform connecting NRI Hindu families to Bhadra Bhagavathi Temple in Karunagapally, Kerala.",
    sameAs: [SITE_URL]
  };
}
