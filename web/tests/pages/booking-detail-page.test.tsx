import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import BookingDetailPage from "../../app/bookings/[id]/page";

vi.mock("../../components/content/Hero", () => ({
  Hero: ({ title, subtitle }: { title: string; subtitle: string }) => (
    <section aria-label="booking-hero">
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

vi.mock("../../components/content/BookingConfirmationActions", () => ({
  BookingConfirmationActions: ({ shareUrl, whatsappMessage }: any) => (
    <div>
      <span>{shareUrl}</span>
      <span>{whatsappMessage}</span>
    </div>
  )
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
      subscription: { tier: "free" }
    }
  }))
}));

vi.mock("../../lib/data", () => ({
  getBooking: vi.fn(async () => ({
    _id: "booking-1",
    bookingReference: "DIVYA-2026-ABC",
    status: "waitlisted",
    devoteeName: "Nair family",
    prayerIntention: "Family peace",
    createdAt: "2026-03-20T00:00:00.000Z",
    puja: {
      _id: "puja-1",
      name: { en: "Abhishekam" }
    }
  }))
}));

describe("BookingDetailPage", () => {
  it("renders the sacred booking confirmation experience", async () => {
    render(await BookingDetailPage({ params: Promise.resolve({ id: "booking-1" }) }));

    expect(screen.getByRole("heading", { name: "Your offering has been received." })).toBeInTheDocument();
    expect(screen.getByText("Abhishekam")).toBeInTheDocument();
    expect(screen.getByText("Booked in the name of: Nair family")).toBeInTheDocument();
    expect(screen.getByText("Share with family")).toBeInTheDocument();
    expect(screen.getByText(/A Abhishekam has been offered/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Learn about Seva/i })).toHaveAttribute(
      "href",
      "/plans?highlight=seva"
    );
  });
});
