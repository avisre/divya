import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { UxProvider, useUx } from "../../components/ux/UxProvider";
import { markPendingOnboarding } from "../../lib/ux-state";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => "/home",
  useRouter: () => ({
    push,
    refresh: vi.fn()
  })
}));

vi.mock("../../lib/analytics", () => ({
  trackEvent: vi.fn()
}));

function UxProbe() {
  const { state, ready } = useUx();

  return (
    <div>
      <span>{ready ? "ready" : "loading"}</span>
      <span>{state.onboardingStartedAt ? "started" : "not-started"}</span>
    </div>
  );
}

describe("UxProvider onboarding", () => {
  it("hydrates onboarding state from the pending marker", async () => {
    markPendingOnboarding();

    render(
      <UxProvider
        user={{
          id: "user-1",
          name: "Anita Nair",
          email: "anita@example.com",
          role: "user"
        }}
      >
        <UxProbe />
      </UxProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("ready")).toBeInTheDocument();
      expect(screen.getByText("started")).toBeInTheDocument();
    });
  });
});
