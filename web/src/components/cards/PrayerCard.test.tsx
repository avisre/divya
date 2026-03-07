import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { PrayerCard } from "@/components/cards/PrayerCard";

describe("PrayerCard", () => {
  it("renders key prayer details", () => {
    render(
      <MemoryRouter>
        <PrayerCard
          prayer={{
            _id: "1",
            slug: "gayatri-mantra",
            title: { en: "Gayatri Mantra" },
            type: "mantra",
            difficulty: "beginner",
            durationMinutes: 5,
            content: {},
            requiredTier: "free"
          }}
        />
      </MemoryRouter>
    );

    expect(screen.getByText("Gayatri Mantra")).toBeInTheDocument();
    expect(screen.getByText(/5 min/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /open prayer/i })).toHaveAttribute("href", "/prayers/gayatri-mantra");
  });
});
