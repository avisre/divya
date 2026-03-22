import { render } from "@testing-library/react";
import { axe } from "jest-axe";
import { describe, expect, it, vi } from "vitest";
import { BookingPanel } from "../../components/forms/BookingPanel";
import type { Puja } from "../../lib/types";

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
    familyName: "",
    suppressPrompts: false
  })
}));

const puja: Puja = {
  _id: "puja-1",
  name: { en: "Abhishekam" },
  type: "Temple offering"
};

describe("BookingPanel accessibility", () => {
  it("has no obvious accessibility violations in the base authenticated state", async () => {
    const { container } = render(<BookingPanel puja={puja} isAuthenticated currentTier="free" />);
    const results = await axe(container);

    expect(results.violations).toHaveLength(0);
  });
});
