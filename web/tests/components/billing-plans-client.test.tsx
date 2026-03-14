import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BillingPlansClient } from "../../components/content/BillingPlansClient";
import { buildStaticBillingCatalog } from "../../lib/subscription-plans";
import type { BillingCatalog } from "../../lib/types";

const sendJsonMock = vi.fn();
const redirectMock = vi.fn();

vi.mock("../../lib/client-api", () => ({
  sendJson: (...args: unknown[]) => sendJsonMock(...args)
}));

vi.mock("../../lib/browser", () => ({
  redirectToExternal: (...args: unknown[]) => redirectMock(...args)
}));

vi.mock("next/navigation", () => ({
  useSearchParams: () => ({
    get: () => null
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
  it("shows annual pricing with yearly labels when the billing toggle changes", () => {
    render(<BillingPlansClient catalog={buildEnabledCatalog()} authenticated={false} subscription={null} />);

    fireEvent.click(screen.getByRole("button", { name: "Annual" }));

    expect(screen.getByText("£49.99")).toBeInTheDocument();
    expect(screen.getByText("£129.99")).toBeInTheDocument();
    expect(screen.getAllByText("/year")).toHaveLength(2);
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
});
