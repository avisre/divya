import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MobileBottomNav } from "../../components/shell/MobileBottomNav";

vi.mock("next/navigation", () => ({
  usePathname: () => "/sessions/create"
}));

describe("MobileBottomNav", () => {
  it("renders the mobile tabs with sessions instead of calendar", () => {
    render(<MobileBottomNav authenticated />);

    expect(screen.getByRole("link", { name: "Learn" })).toHaveAttribute("href", "/learn");
    expect(screen.getByRole("link", { name: "Sessions" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Calendar" })).not.toBeInTheDocument();
  });

  it("hides sessions for guests", () => {
    render(<MobileBottomNav authenticated={false} />);

    expect(screen.getByRole("link", { name: "Learn" })).toHaveAttribute("href", "/learn");
    expect(screen.queryByRole("link", { name: "Sessions" })).not.toBeInTheDocument();
  });
});
