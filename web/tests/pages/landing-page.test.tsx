import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import LandingPage from "../../app/page";

vi.mock("../../components/content/Hero", () => ({
  Hero: ({ title, subtitle, actions, supportingContent, aside }: any) => (
    <section aria-label="hero">
      <h1>{title}</h1>
      <p>{subtitle}</p>
      <div>{actions}</div>
      <div>{supportingContent}</div>
      <div>{aside}</div>
    </section>
  )
}));

vi.mock("../../components/content/MetricGrid", () => ({
  MetricGrid: ({ items }: any) => (
    <div>
      {items.map((item: any) => (
        <span key={item.label}>{item.label}</span>
      ))}
    </div>
  )
}));

vi.mock("../../components/content/PanchangSummary", () => ({
  PanchangSummary: () => <div>panchang summary</div>
}));

vi.mock("../../components/content/PrayerCard", () => ({
  PrayerCard: ({ prayer }: any) => <div>{prayer.title}</div>
}));

vi.mock("../../components/content/PujaCard", () => ({
  PujaCard: ({ puja }: any) => <div>{puja.name.en}</div>
}));

vi.mock("../../components/content/Section", () => ({
  Section: ({ title, subtitle, children }: any) => (
    <section>
      <h2>{title}</h2>
      <p>{subtitle}</p>
      {children}
    </section>
  )
}));

vi.mock("../../components/content/StructuredData", () => ({
  StructuredData: () => null
}));

vi.mock("../../components/ui/Button", () => ({
  Button: ({ href, children }: any) =>
    href ? <a href={href}>{children}</a> : <button type="button">{children}</button>
}));

vi.mock("../../lib/data", () => ({
  getFeaturedPrayers: vi.fn(async () => [{ _id: "prayer-1", title: "Morning prayer" }]),
  getPanchangToday: vi.fn(async () => ({
    tithi: { name: "Ekadashi" },
    nakshatra: { name: "Rohini" },
    dailyGuidance: { overall: "A calm day for prayer." }
  })),
  getPujas: vi.fn(async () => [{ _id: "puja-1", name: { en: "Bhagavathi Puja" } }]),
  getTemple: vi.fn(async () => ({ name: "Bhadra Bhagavathi Temple" }))
}));

vi.mock("../../lib/presentation", () => ({
  OM_SYMBOL: "\u0950",
  getPanchangTone: () => "warm",
  getTempleVisual: () => ({ src: "/temple.svg", alt: "Temple" })
}));

vi.mock("../../lib/session", () => ({
  getOptionalSession: vi.fn(async () => null)
}));

describe("LandingPage", () => {
  it("renders the simplified hero CTA and new orientation sections", async () => {
    render(await LandingPage());

    const hero = screen.getByLabelText("hero");

    expect(within(hero).getByRole("link", { name: "Start free - no card needed" })).toHaveAttribute(
      "href",
      "/register"
    );
    expect(within(hero).getByRole("link", { name: "Sign in" })).toHaveAttribute("href", "/login");
    expect(within(hero).queryByText("Compare plans")).not.toBeInTheDocument();
    expect(within(hero).getByText("Free to begin. Upgrade only when your family is ready.")).toBeInTheDocument();
    expect(
      within(hero).getByText("Serving NRI families across the UK, US, Canada, UAE, and Australia")
    ).toBeInTheDocument();

    expect(screen.getByText("How Prarthana works")).toBeInTheDocument();
    expect(screen.getByText("What brings your family here today?")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Begin your first prayer - it's free" })).toHaveAttribute(
      "href",
      "/register"
    );
  });
});
