import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BillingPlansClient } from "../../components/content/BillingPlansClient";
import { buildStaticBillingCatalog } from "../../lib/subscription-plans";
import type { BillingCatalog } from "../../lib/types";

const sendJsonMock = vi.fn();
const redirectMock = vi.fn();
const searchParamState = {
  highlight: null as string | null
};

vi.mock("../../lib/client-api", () => ({
  sendJson: (...args: unknown[]) => sendJsonMock(...args)
}));

vi.mock("../../lib/browser", () => ({
  redirectToExternal: (...args: unknown[]) => redirectMock(...args)
}));

vi.mock("next/navigation", () => ({
  useSearchParams: () => ({
    get: (key: string) => (key === "highlight" ? searchParamState.highlight : null)
  })
}));

function buildEnabledCatalog(): BillingCatalog {
  const catalog = buildStaticBillingCatalog();
  return {
    ...catalog,
    enabled: true,
    subscriptionsConfigured: true,
    plans: catalog.plans.map((plan) => ({
      ...plan,
      prices: Object.fromEntries(
        Object.entries(plan.prices || {}).map(([interval, price]) => [
          interval,
          {
            ...price,
            active: true,
            priceId: `price_${plan.tier}_${interval}`
          }
        ])
      )
    }))
  };
}

describe("BillingPlansClient", () => {
  it("shows annual pricing with yearly labels and savings when the billing toggle changes", () => {
    render(<BillingPlansClient catalog={buildEnabledCatalog()} authenticated={false} subscription={null} />);

    fireEvent.click(screen.getByRole("button", { name: "Annual" }));

    expect(screen.getByText("£49.99")).toBeInTheDocument();
    expect(screen.getByText("£129.99")).toBeInTheDocument();
    expect(screen.getAllByText("/year")).toHaveLength(2);
    expect(screen.getAllByText(/Save £/)).toHaveLength(2);
  });

  it("reveals the Seva preview panel for guests and routes them to register", () => {
    render(<BillingPlansClient catalog={buildEnabledCatalog()} authenticated={false} subscription={null} />);

    fireEvent.click(
      screen.getByRole("button", { name: "Bhadra Bhagavathi Temple devotional illustration" })
    );

    expect(
      screen.getByText("Sample recording available to Seva members. Create your account to access the archive.")
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Create account" })).toHaveAttribute("href", "/register");
  });

  it("routes authenticated paid-plan checkout requests through the backend proxy", async () => {
    sendJsonMock.mockResolvedValueOnce({
      id: "cs_123",
      url: "https://checkout.stripe.com/c/pay/cs_123"
    });

    render(
      <BillingPlansClient
        catalog={buildEnabledCatalog()}
        authenticated
        subscription={{ tier: "free" }}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Annual" }));
    fireEvent.click(screen.getByRole("button", { name: "Choose Bhakt" }));

    await waitFor(() => {
      expect(sendJsonMock).toHaveBeenCalledWith(
        "/api/backend/billing/checkout-session",
        expect.objectContaining({ method: "POST" })
      );
    });

    expect(redirectMock).toHaveBeenCalledWith("https://checkout.stripe.com/c/pay/cs_123");
  });

  it("visually highlights the requested plan from the query string", () => {
    searchParamState.highlight = "seva";

    render(<BillingPlansClient catalog={buildEnabledCatalog()} authenticated={false} subscription={null} />);

    expect(screen.getByTestId("plan-card-seva").className).toMatch(/highlight/);
    expect(screen.getByTestId("plan-card-bhakt").className).not.toMatch(/highlight/);

    searchParamState.highlight = null;
  });
});
