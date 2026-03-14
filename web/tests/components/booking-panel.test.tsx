import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BookingPanel } from "../../components/forms/BookingPanel";
import type { Puja } from "../../lib/types";

const sendJsonMock = vi.fn();

vi.mock("../../lib/client-api", () => ({
  sendJson: (...args: unknown[]) => sendJsonMock(...args)
}));

vi.mock("../../components/ux/UxProvider", () => ({
  useUx: () => ({
    markGiftCompleted: vi.fn(),
    markGiftStarted: vi.fn()
  })
}));

const puja: Puja = {
  _id: "puja-1",
  name: { en: "Abhishekam" },
  type: "Temple offering",
  bestFor: ["Protection", "Family harmony", "New beginnings"]
};

describe("BookingPanel", () => {
  it("reveals recipient fields in gift mode and validates them", async () => {
    render(<BookingPanel puja={puja} isAuthenticated />);

    fireEvent.click(screen.getByRole("button", { name: /Gift to someone/i }));

    expect(screen.getByLabelText(/Recipient name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Recipient email/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Offer this puja as a gift/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/Recipient name is required for a gifted puja/i)
      ).toBeInTheDocument();
    });
  });

  it("submits the standard waitlist flow in self mode", async () => {
    sendJsonMock.mockResolvedValueOnce({
      booking: {
        _id: "booking-1",
        bookingReference: "DIVYA-001",
        status: "waitlisted",
        devoteeName: "Anita",
        createdAt: "2026-03-13T00:00:00.000Z"
      }
    });

    render(<BookingPanel puja={puja} isAuthenticated />);

    fireEvent.change(screen.getByLabelText(/Devotee name/i), { target: { value: "Anita" } });
    fireEvent.change(screen.getByLabelText(/^Gothram$/i), { target: { value: "Kashyapa" } });
    fireEvent.change(screen.getByLabelText(/Nakshatra/i), { target: { value: "Ashwati" } });
    fireEvent.change(screen.getByLabelText(/Prayer intention/i), {
      target: { value: "Protection for my family" }
    });

    fireEvent.click(screen.getByRole("button", { name: /^Join waitlist$/i }));

    await waitFor(() => {
      expect(sendJsonMock).toHaveBeenCalledWith(
        "/api/backend/bookings",
        expect.objectContaining({ method: "POST" })
      );
    });
  });
});
