import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
const sendJson = vi.fn();
const guidedFlowState = {
  familyName: "",
  suppressPrompts: false
};

vi.mock("../../lib/client-api", async () => {
  const actual = await vi.importActual<typeof import("../../lib/client-api")>(
    "../../lib/client-api"
  );
  return {
    ...actual,
    sendJson: (...args: unknown[]) => sendJson(...args)
  };
});

import { BookingPanel } from "../../components/forms/BookingPanel";
import { ApiRequestError } from "../../lib/client-api";

vi.mock("../../components/ux/UxProvider", () => ({
  useUx: () => ({
    dismissPrompt: vi.fn(),
    markGiftCompleted: vi.fn(),
    markGiftStarted: vi.fn(),
    state: {}
  })
}));

vi.mock("../../components/ux/GuidedFlowProvider", () => ({
  useGuidedFlow: () => ({
    familyName: guidedFlowState.familyName,
    suppressPrompts: guidedFlowState.suppressPrompts
  })
}));

describe("BookingPanel", () => {
  const puja = {
    _id: "puja-1",
    name: { en: "Bhagavathi Puja" },
    bestFor: ["Festival blessing", "Family healing"]
  } as any;

  beforeEach(() => {
    sendJson.mockReset();
    sendJson.mockResolvedValue({});
    guidedFlowState.familyName = "";
    guidedFlowState.suppressPrompts = false;
  });

  it("shows the sign-in guard for guests", () => {
    render(<BookingPanel puja={puja} isAuthenticated={false} currentTier="free" />);

    expect(screen.getByText("Sign in to join the temple waitlist")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Sign in to continue" })).toHaveAttribute(
      "href",
      "/login?next=%2Fpujas%2Fpuja-1"
    );
  });

  it("switches into the gift booking flow inline", () => {
    render(<BookingPanel puja={puja} isAuthenticated currentTier="free" />);

    fireEvent.click(screen.getByRole("button", { name: /book this as a gift/i }));

    expect(screen.getByLabelText("Recipient's name")).toBeInTheDocument();
    expect(screen.getByLabelText("Send gift confirmation to")).toBeInTheDocument();
    expect(screen.getByLabelText("Your message")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Book gift puja" })).toBeInTheDocument();
    expect(screen.getByText("Preferred date (optional)")).toBeInTheDocument();
  });

  it("shows the waitlist limit prompt when the backend rejects a second free waitlist", async () => {
    sendJson.mockRejectedValueOnce(
      new ApiRequestError({
        message: "You have one active waitlist",
        status: 409,
        payload: {
          details: {
            reason: "waitlist_limit",
            activeBooking: {
              _id: "booking-1",
              bookingReference: "DIVYA-2026-ABC",
              status: "waitlisted",
              puja: { _id: "puja-0", name: { en: "Abhishekam" } }
            }
          }
        }
      })
    );

    render(<BookingPanel puja={puja} isAuthenticated currentTier="free" />);

    fireEvent.change(screen.getByLabelText("Devotee name"), {
      target: { value: "Anita Nair" }
    });
    fireEvent.change(screen.getByLabelText("Prayer intention"), {
      target: { value: "Family blessing and peace." }
    });
    fireEvent.click(screen.getByRole("button", { name: "Join sacred waitlist" }));

    await waitFor(() =>
      expect(screen.getByText("You have one active waitlist")).toBeInTheDocument()
    );
    expect(screen.getByRole("link", { name: "Manage your current waitlist" })).toHaveAttribute(
      "href",
      "/bookings/booking-1"
    );
    expect(screen.getByRole("link", { name: "Upgrade to Bhakt" })).toHaveAttribute(
      "href",
      "/plans?highlight=bhakt"
    );
  });

  it("prefills the devotee name from the saved family name", () => {
    guidedFlowState.familyName = "Nair Family";

    render(<BookingPanel puja={puja} isAuthenticated currentTier="free" />);

    expect(screen.getByTestId("booking-family-name")).toHaveValue("Nair Family");
  });
});
