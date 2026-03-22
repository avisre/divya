import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import LearnIndexPage from "../../app/learn/page";
import LearnCategoryPage from "../../app/learn/category/[cat]/page";
import LearnEntryPage from "../../app/learn/[slug]/page";

const getOptionalSessionMock = vi.fn();
const getPujasMock = vi.fn();

vi.mock("../../lib/session", () => ({
  getOptionalSession: (...args: unknown[]) => getOptionalSessionMock(...args)
}));

vi.mock("../../lib/data", () => ({
  getPujas: (...args: unknown[]) => getPujasMock(...args)
}));

vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("notFound");
  }
}));

describe("Learn pages", () => {
  beforeEach(() => {
    getOptionalSessionMock.mockReset();
    getPujasMock.mockReset();
    getOptionalSessionMock.mockResolvedValue(null);
    getPujasMock.mockResolvedValue([
      { _id: "puja-1", slug: "abhishekam", name: { en: "Abhishekam" } },
      { _id: "puja-2", slug: "sahasranama-archana", name: { en: "Sahasranama Archana" } },
      { _id: "puja-3", slug: "kalasha-puja", name: { en: "Kalasha Puja" } }
    ]);
  });

  it("renders the Learn index with featured, category, and beginner sections", async () => {
    render(<LearnIndexPage />);

    expect(screen.getByTestId("learn-index")).toBeInTheDocument();
    expect(within(screen.getByTestId("learn-featured")).getAllByTestId("learn-card")).toHaveLength(3);
    expect(screen.getAllByTestId("learn-category")).toHaveLength(5);
    expect(within(screen.getByTestId("learn-begin")).getAllByTestId("learn-card")).toHaveLength(3);
  });

  it("renders a free Learn entry in full for logged-out readers", async () => {
    render(await LearnEntryPage({ params: Promise.resolve({ slug: "bhadra-bhagavathi" }) }));

    expect(screen.getByTestId("learn-entry-title")).toHaveTextContent("Bhadra Bhagavathi");
    expect(screen.getByTestId("learn-entry-body")).toBeInTheDocument();
    expect(screen.queryByTestId("learn-paywall")).not.toBeInTheDocument();
    expect(screen.getByTestId("learn-connect-practice")).toBeInTheDocument();
    expect(screen.getAllByTestId("learn-related-card").length).toBeGreaterThanOrEqual(1);

    const breadcrumb = screen.getByTestId("learn-breadcrumb");
    expect(within(breadcrumb).getByRole("link", { name: "Learn" })).toHaveAttribute("href", "/learn");
  });

  it("shows a preview and Bhakt paywall for locked Learn entries on free accounts", async () => {
    render(await LearnEntryPage({ params: Promise.resolve({ slug: "murugan" }) }));

    const preview = screen.getByTestId("learn-entry-preview");
    const previewWordCount = (preview.textContent || "").trim().split(/\s+/).filter(Boolean).length;

    expect(previewWordCount).toBeLessThanOrEqual(110);
    expect(screen.getByTestId("learn-paywall")).toBeInTheDocument();
    expect(screen.getByTestId("learn-paywall-cta")).toHaveAttribute("href", "/plans?highlight=bhakt");
  });

  it("shows the full article to Bhakt readers on locked Learn entries", async () => {
    getOptionalSessionMock.mockResolvedValue({
      user: {
        subscription: { tier: "bhakt" }
      }
    });

    render(await LearnEntryPage({ params: Promise.resolve({ slug: "murugan" }) }));

    expect(screen.getByTestId("learn-entry-body")).toBeInTheDocument();
    expect(screen.queryByTestId("learn-entry-preview")).not.toBeInTheDocument();
    expect(screen.queryByTestId("learn-paywall")).not.toBeInTheDocument();
  });

  it("renders category pages for filtered Learn browsing", async () => {
    render(await LearnCategoryPage({ params: Promise.resolve({ cat: "festivals" }) }));

    expect(screen.getAllByRole("heading", { name: "Festivals" }).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByTestId("learn-card").length).toBeGreaterThan(0);
  });
});
