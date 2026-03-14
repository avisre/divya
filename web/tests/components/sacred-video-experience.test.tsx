import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SacredVideoExperience } from "../../components/content/SacredVideoExperience";
import type { PujaBooking, UserSession } from "../../lib/types";

vi.mock("next/image", () => ({
  default: ({ alt }: { alt: string }) => <img alt={alt} />
}));

vi.mock("../../components/forms/BookingVideoPlayer", () => ({
  BookingVideoPlayer: ({ src }: { src: string }) => <div>Video player: {src}</div>
}));

vi.mock("../../components/forms/VideoNotificationToggle", () => ({
  VideoNotificationToggle: () => <div>Video notification toggle</div>
}));

const user: UserSession = {
  id: "user-1",
  name: "Anita",
  email: "anita@example.com",
  role: "user",
  timezone: "America/Toronto"
};

const booking: PujaBooking = {
  _id: "booking-1",
  bookingReference: "DIVYA-001",
  status: "video_ready",
  devoteeName: "Anita",
  createdAt: "2026-03-14T00:00:00.000Z",
  puja: {
    _id: "puja-1",
    name: { en: "Abhishekam" },
    type: "Temple offering",
    videoDelivered: true
  }
};

describe("SacredVideoExperience", () => {
  it("renders the ready state with archive actions", () => {
    render(
      <SacredVideoExperience
        booking={booking}
        user={user}
        video={{ url: "https://signed.example/video.mp4" }}
      />
    );

    expect(screen.getByText(/Video player:/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Download for family archive/i })).toBeInTheDocument();
    expect(screen.getByText(/private to your account/i)).toBeInTheDocument();
  });

  it("renders the processing state when a signed video is not yet available", () => {
    render(<SacredVideoExperience booking={{ ...booking, status: "completed" }} user={user} video={null} />);

    expect(screen.getByText(/recording is being prepared/i)).toBeInTheDocument();
    expect(screen.getByText(/Video notification toggle/i)).toBeInTheDocument();
  });
});
