import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SiteHeader } from "../../components/shell/SiteHeader";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn()
  }),
  usePathname: () => "/home"
}));

vi.mock("../../components/auth/LogoutButton", () => ({
  LogoutButton: () => <button type="button">Sign out</button>
}));

describe("SiteHeader", () => {
  it("shows sessions in primary navigation for authenticated users", () => {
    render(
      <SiteHeader
        user={{
          id: "user-1",
          name: "Anita Nair",
          email: "anita@example.com",
          role: "user"
        }}
      />
    );

    expect(screen.getByRole("link", { name: "Sessions" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Anita Nair/i }));

    expect(screen.getByRole("link", { name: "My bookings" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "My profile" })).toBeInTheDocument();
  });

  it("closes the account menu when the user clicks outside it", () => {
    render(
      <SiteHeader
        user={{
          id: "user-1",
          name: "Anita Nair",
          email: "anita@example.com",
          role: "user"
        }}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /Anita Nair/i }));
    expect(screen.getByRole("link", { name: "My profile" })).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("Close account menu"));
    expect(screen.queryByRole("link", { name: "My profile" })).not.toBeInTheDocument();
  });

  it("shows sign in and sign up for guests", () => {
    render(<SiteHeader user={null} />);

    expect(screen.getByRole("link", { name: "Sign in" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Sign up" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Sessions" })).not.toBeInTheDocument();
  });
});
