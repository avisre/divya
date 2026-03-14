import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MobileBottomNav } from "../../components/shell/MobileBottomNav";

vi.mock("next/navigation", () => ({
  usePathname: () => "/sessions/create"
}));

describe("MobileBottomNav", () => {
  it("renders the mobile tabs with sessions instead of calendar", () => {
    render(<MobileBottomNav authenticated />);

    expect(screen.getByRole("link", { name: "Sessions" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Calendar" })).not.toBeInTheDocument();
  });
});
