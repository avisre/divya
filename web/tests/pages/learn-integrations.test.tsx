import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import HomePage from "../../app/home/page";
import PrayerDetailPage from "../../app/prayers/[slug]/page";
import PujaDetailPage from "../../app/pujas/[id]/page";

const getPrayerMock = vi.fn();
const getPrayerAudioMock = vi.fn();
const getPujaMock = vi.fn();
const getPanchangTodayMock = vi.fn();
const getBookingsMock = vi.fn();
const getDailyRecommendationMock = vi.fn();
const getFeaturedPrayersMock = vi.fn();
const getGiftBookingsReceivedMock = vi.fn();
const getGiftBookingsSentMock = vi.fn();
const getPujasMock = vi.fn();
const getStatsMock = vi.fn();
const getUserPrayerSessionsMock = vi.fn();
const getOptionalSessionMock = vi.fn();
const requireSessionMock = vi.fn();

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
  PrayerCard: ({ prayer }: any) => <div>{prayer.title.en}</div>
}));

vi.mock("../../components/content/PujaCard", () => ({
  PujaCard: ({ puja }: any) => <div>{puja.name.en}</div>
}));

vi.mock("../../components/content/Section", () => ({
  Section: ({ title, subtitle, children, dataTestId }: any) => (
    <section data-testid={dataTestId}>
      <h2>{title}</h2>
      <p>{subtitle}</p>
      {children}
    </section>
  )
}));

vi.mock("../../components/content/StructuredData", () => ({
  StructuredData: () => null
}));

vi.mock("../../components/forms/BookingPanel", () => ({
  BookingPanel: () => <div>booking panel</div>
}));

vi.mock("../../components/forms/PrayerDetailClient", () => ({
  PrayerDetailClient: () => <div>prayer detail client</div>
}));

vi.mock("../../components/ux/GuidedFlowResumeBanner", () => ({
  GuidedFlowResumeBanner: () => <div>resume banner</div>
}));

vi.mock("../../components/ux/HomeDiscovery", () => ({
  HomeDiscovery: () => <div>home discovery</div>
}));

vi.mock("../../components/ui/Button", () => ({
  Button: ({ href, children }: any) =>
    href ? <a href={href}>{children}</a> : <button type="button">{children}</button>
}));

vi.mock("../../lib/data", () => ({
  getPrayer: (...args: unknown[]) => getPrayerMock(...args),
  getPrayerAudio: (...args: unknown[]) => getPrayerAudioMock(...args),
  getPuja: (...args: unknown[]) => getPujaMock(...args),
  getPanchangToday: (...args: unknown[]) => getPanchangTodayMock(...args),
  getBookings: (...args: unknown[]) => getBookingsMock(...args),
  getDailyRecommendation: (...args: unknown[]) => getDailyRecommendationMock(...args),
  getFeaturedPrayers: (...args: unknown[]) => getFeaturedPrayersMock(...args),
  getGiftBookingsReceived: (...args: unknown[]) => getGiftBookingsReceivedMock(...args),
  getGiftBookingsSent: (...args: unknown[]) => getGiftBookingsSentMock(...args),
  getPujas: (...args: unknown[]) => getPujasMock(...args),
  getStats: (...args: unknown[]) => getStatsMock(...args),
  getUserPrayerSessions: (...args: unknown[]) => getUserPrayerSessionsMock(...args)
}));

vi.mock("../../lib/session", () => ({
  getOptionalSession: (...args: unknown[]) => getOptionalSessionMock(...args),
  requireSession: (...args: unknown[]) => requireSessionMock(...args)
}));

vi.mock("../../lib/presentation", () => ({
  getDeitySymbol: () => "\u0950",
  getPrayerTypeMeta: () => ({
    label: "Mantra",
    descriptor: "Guided"
  }),
  getPujaBenefitCards: () => [
    {
      title: "Temple-led offering",
      description: "Performed in the Kerala Tantric tradition."
    }
  ],
  getTempleVisual: () => ({
    src: "/temple.svg",
    alt: "Temple"
  })
}));

describe("Learn integrations", () => {
  beforeEach(() => {
    getPrayerMock.mockReset();
    getPrayerAudioMock.mockReset();
    getPujaMock.mockReset();
    getPanchangTodayMock.mockReset();
    getBookingsMock.mockReset();
    getDailyRecommendationMock.mockReset();
    getFeaturedPrayersMock.mockReset();
    getGiftBookingsReceivedMock.mockReset();
    getGiftBookingsSentMock.mockReset();
    getPujasMock.mockReset();
    getStatsMock.mockReset();
    getUserPrayerSessionsMock.mockReset();
    getOptionalSessionMock.mockReset();
    requireSessionMock.mockReset();

    getPrayerAudioMock.mockResolvedValue(null);
    getOptionalSessionMock.mockResolvedValue(null);
    getPanchangTodayMock.mockResolvedValue({
      tithi: { name: "Panchami" },
      festivalPrep: [
        {
          festivalId: "festival-1",
          slug: "navaratri",
          name: { en: "Navaratri" },
          startsInDays: 2,
          preparationDays: 9
        }
      ]
    });
    getBookingsMock.mockResolvedValue([]);
    getDailyRecommendationMock.mockResolvedValue(null);
    getFeaturedPrayersMock.mockResolvedValue([{ _id: "prayer-1", title: { en: "Gayatri Mantra" } }]);
    getGiftBookingsReceivedMock.mockResolvedValue([]);
    getGiftBookingsSentMock.mockResolvedValue([]);
    getPujasMock.mockResolvedValue([{ _id: "puja-1", slug: "abhishekam", name: { en: "Abhishekam" } }]);
    getStatsMock.mockResolvedValue({
      tier: { key: "SEEKER", icon: "\u0950", progressPercent: 0, nextTier: null },
      totalLotusPoints: 0,
      daysPracticedThisMonth: 0,
      familySessionsCount: 0,
      modulesCompletedCount: 0
    });
    getUserPrayerSessionsMock.mockResolvedValue([]);
    requireSessionMock.mockResolvedValue({
      token: "session-token",
      user: {
        id: "user-1",
        name: "Anita",
        email: "anita@example.com",
        role: "user",
        subscription: { tier: "free" }
      }
    });
  });

  it("links the Gayatri prayer page to the Saraswati Learn entry", async () => {
    getPrayerMock.mockResolvedValue({
      _id: "prayer-1",
      slug: "gayatri-mantra",
      title: { en: "Gayatri Mantra" },
      type: "mantra",
      durationMinutes: 3,
      deity: {
        _id: "deity-1",
        slug: "surya",
        name: { en: "Surya" }
      },
      content: {
        devanagari: "\u0950 \u092d\u0942\u0930\u094d \u092d\u0941\u0935\u0903"
      }
    });

    render(await PrayerDetailPage({ params: Promise.resolve({ slug: "gayatri-mantra" }) }));

    expect(screen.getByTestId("prayer-deity-learn")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Read more/i })).toHaveAttribute("href", "/learn/saraswati");
    expect(screen.getByTestId("prayer-deity-learn-subtitle").textContent?.length).toBeGreaterThan(0);
  });

  it("links the Mahishasura Mardini prayer page to the Bhagavathi Learn entry", async () => {
    getPrayerMock.mockResolvedValue({
      _id: "prayer-2",
      slug: "mahishasura-mardini",
      title: { en: "Mahishasura Mardini Stotram" },
      type: "stotram",
      durationMinutes: 12,
      deity: {
        _id: "deity-2",
        slug: "bhadra-bhagavathi",
        name: { en: "Bhadra Bhagavathi" }
      },
      content: {
        devanagari: "\u0950 \u0905\u092f\u093f"
      }
    });

    render(await PrayerDetailPage({ params: Promise.resolve({ slug: "mahishasura-mardini" }) }));

    expect(screen.getByRole("link", { name: /Read more/i })).toHaveAttribute(
      "href",
      "/learn/bhadra-bhagavathi"
    );
  });

  it("links the Abhishekam puja page to the Learn explanation", async () => {
    getPujaMock.mockResolvedValue({
      _id: "puja-1",
      slug: "abhishekam",
      name: { en: "Abhishekam" },
      temple: { _id: "temple-1" },
      displayPrice: { amount: 40, currency: "GBP" },
      duration: 60,
      estimatedWaitWeeks: 1,
      description: {
        short: "A sacred bath for the deity.",
        full: "The deity is bathed in sanctified offerings.",
        whatHappens: "The Tantri performs the full ritual in your name."
      },
      requirements: ["Family name"],
      bestFor: ["Family blessing"]
    });

    render(await PujaDetailPage({ params: Promise.resolve({ id: "puja-1" }) }));

    expect(screen.getByTestId("puja-learn-section")).toBeInTheDocument();
    expect(screen.getByTestId("puja-learn-link")).toHaveAttribute("href", "/learn/customs-abhishekam");
    expect(screen.getByTestId("puja-learn-subtitle").textContent?.length).toBeGreaterThan(0);
  });

  it("adds the festival Learn link to the homepage nudge", async () => {
    render(await HomePage());

    const learnLink = screen.getByTestId("festival-nudge-learn");
    expect(learnLink).toHaveAttribute("href", "/learn/festivals-navaratri");
    expect(learnLink).not.toHaveAttribute("target");
  });
});
