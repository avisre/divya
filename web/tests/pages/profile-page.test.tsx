import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ProfilePage from "../../app/profile/page";

vi.mock("../../lib/session", () => ({
  requireSession: vi.fn(async () => ({
    token: "token-1",
    user: {
      id: "user-1",
      name: "Anita Nair",
      email: "anita@example.com",
      role: "user"
    }
  }))
}));

vi.mock("../../lib/data", () => ({
  getProfile: vi.fn(async () => ({
    id: "user-1",
    name: "Anita Nair",
    email: "anita@example.com",
    role: "user",
    timezone: "America/New_York",
    subscription: { tier: "free" },
    streak: { current: 0, longest: 0 }
  })),
  getStats: vi.fn(async () => ({
    totalLotusPoints: 0,
    prayersOpenedCount: 0,
    prayersCompletedCount: 0,
    modulesCompletedCount: 0,
    familySessionsCount: 0,
    daysPracticedThisMonth: 0
  }))
}));

vi.mock("../../components/forms/ProfileForm", () => ({
  ProfileForm: () => <div>profile form</div>
}));

describe("ProfilePage", () => {
  it("renders a single devotional record section", async () => {
    render(await ProfilePage());

    expect(screen.getAllByText("Your devotional record")).toHaveLength(1);
    expect(screen.getByText(/Your practice is taking shape/i)).toBeInTheDocument();
    expect(screen.getByText("Your milestones")).toBeInTheDocument();
  });
});
