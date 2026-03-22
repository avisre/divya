import { render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GoogleAnalytics } from "../../components/analytics/GoogleAnalytics";

const navigationState = {
  pathname: "/home",
  search: ""
};

const trackPageView = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => navigationState.pathname,
  useSearchParams: () => new URLSearchParams(navigationState.search)
}));

vi.mock("next/script", () => ({
  default: ({ src, ...props }: { src?: string; [key: string]: unknown }) => (
    <script data-src={src} data-domain={String(props["data-domain"] || "")} />
  )
}));

vi.mock("../../lib/analytics", () => ({
  PLAUSIBLE_API_HOST: "https://plausible.example",
  PLAUSIBLE_DOMAIN: "praarthana.com",
  trackPageView: (...args: unknown[]) => trackPageView(...args)
}));

describe("GoogleAnalytics", () => {
  beforeEach(() => {
    navigationState.pathname = "/home";
    navigationState.search = "";
    trackPageView.mockReset();
  });

  it("renders the Plausible script tag", () => {
    const { container } = render(<GoogleAnalytics />);

    expect(
      container.querySelector('script[data-src="https://plausible.example/js/script.js"]')
    ).toBeTruthy();
    expect(container.querySelector('script[data-domain="praarthana.com"]')).toBeTruthy();
  });

  it("tracks client-side route changes after the initial render", async () => {
    const { rerender } = render(<GoogleAnalytics />);

    navigationState.pathname = "/prayers";
    navigationState.search = "type=mantra";
    rerender(<GoogleAnalytics />);

    await waitFor(() => expect(trackPageView).toHaveBeenCalledWith("/prayers?type=mantra"));
  });
});
