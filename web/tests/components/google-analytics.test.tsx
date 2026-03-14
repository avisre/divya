import { render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GoogleAnalytics } from "../../components/analytics/GoogleAnalytics";
import { GA_MEASUREMENT_ID } from "../../lib/analytics";

const navigationState = {
  pathname: "/home",
  search: ""
};

vi.mock("next/navigation", () => ({
  usePathname: () => navigationState.pathname,
  useSearchParams: () => new URLSearchParams(navigationState.search)
}));

vi.mock("next/script", () => ({
  default: ({ id, src, children }: { id?: string; src?: string; children?: string }) => (
    <script data-script-id={id} data-src={src}>
      {children}
    </script>
  )
}));

describe("GoogleAnalytics", () => {
  beforeEach(() => {
    navigationState.pathname = "/home";
    navigationState.search = "";
    window.gtag = vi.fn();
  });

  it("renders the GA script tags", () => {
    const { container } = render(<GoogleAnalytics />);

    expect(container.querySelector(`script[data-src="https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}"]`)).toBeTruthy();
    expect(container.querySelector('script[data-script-id="google-analytics"]')).toBeTruthy();
  });

  it("tracks client-side route changes", async () => {
    const { rerender } = render(<GoogleAnalytics />);

    navigationState.pathname = "/prayers";
    navigationState.search = "type=mantra";
    rerender(<GoogleAnalytics />);

    await waitFor(() =>
      expect(window.gtag).toHaveBeenCalledWith("config", GA_MEASUREMENT_ID, {
        page_path: "/prayers?type=mantra",
        page_location: window.location.href,
        page_title: document.title
      })
    );
  });
});
