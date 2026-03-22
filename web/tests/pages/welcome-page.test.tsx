import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import WelcomePage from "../../app/welcome/page";

vi.mock("../../components/content/Hero", () => ({
  Hero: ({ title, subtitle }: { title: string; subtitle: string }) => (
    <section aria-label="welcome-hero">
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </section>
  )
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

vi.mock("../../components/ux/WelcomePageTracker", () => ({
  WelcomePageTracker: () => null
}));

vi.mock("../../components/ux/WelcomeDismissButton", () => ({
  WelcomeDismissButton: () => <button type="button">Continue your introduction -&gt;</button>
}));

vi.mock("../../components/ui/Button", () => ({
  Button: ({ href, children }: any) => <a href={href}>{children}</a>
}));

vi.mock("../../lib/session", () => ({
  requireSession: vi.fn(async () => ({
    token: "session-token",
    user: {
      id: "user-1",
      name: "Anita Nair",
      email: "anita@example.com",
      role: "user",
      timezone: "Asia/Kolkata"
    }
  }))
}));

vi.mock("../../lib/data", () => ({
  getPanchangToday: vi.fn(async () => ({
    tithi: { name: "Ekadashi" },
    dailyGuidance: { overall: "A good day to begin with prayer." }
  }))
}));

describe("WelcomePage", () => {
  it("renders the post-signup welcome choices", async () => {
    render(await WelcomePage());

    expect(screen.getByRole("heading", { name: "Namaste, Anita." })).toBeInTheDocument();
    expect(screen.getByText("Your account is ready. Here is where to begin.")).toBeInTheDocument();
    expect(screen.getByText("Explore prayers")).toBeInTheDocument();
    expect(screen.getByText("Check today's panchang")).toBeInTheDocument();
    expect(screen.getByText("Book a puja for your family")).toBeInTheDocument();
    expect(screen.getByText(/Today is Ekadashi/i)).toBeInTheDocument();
    expect(
      screen.getByText("Your account is free to keep. Upgrade any time when your family wants more.")
    ).toBeInTheDocument();
  });
});
