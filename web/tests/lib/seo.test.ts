import { describe, expect, it } from "vitest";
import {
  buildBreadcrumbSchema,
  buildPrivateMetadata,
  buildPublicMetadata
} from "../../lib/seo";

describe("seo helpers", () => {
  it("builds public metadata with canonical, open graph, and twitter data", () => {
    const metadata = buildPublicMetadata({
      title: "Temple",
      description: "Temple story",
      path: "/temple",
      imagePath: "/images/temple.jpg"
    });

    expect(metadata.alternates?.canonical).toContain("/temple");
    expect(metadata.openGraph?.url).toContain("/temple");
    expect(metadata.twitter).toMatchObject({
      card: "summary_large_image"
    });
  });

  it("builds private metadata with noindex directives", () => {
    const metadata = buildPrivateMetadata({
      title: "Profile",
      description: "Private profile"
    });

    expect(metadata.robots).toMatchObject({
      index: false,
      follow: false
    });
  });

  it("builds breadcrumb schema with ordered list items", () => {
    const schema = buildBreadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "Pujas", path: "/pujas" }
    ]);

    expect(schema["@type"]).toBe("BreadcrumbList");
    expect(schema.itemListElement).toHaveLength(2);
    expect(schema.itemListElement[1]).toMatchObject({
      position: 2,
      name: "Pujas"
    });
  });
});
