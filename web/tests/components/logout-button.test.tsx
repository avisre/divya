import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LogoutButton } from "../../components/auth/LogoutButton";

const replace = vi.fn();
const refresh = vi.fn();
const sendJson = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace,
    refresh
  })
}));

vi.mock("../../lib/client-api", () => ({
  sendJson: (...args: unknown[]) => sendJson(...args)
}));

describe("LogoutButton", () => {
  it("posts through the CSRF-aware client helper and refreshes the app shell", async () => {
    sendJson.mockResolvedValue({ success: true });

    render(<LogoutButton />);

    fireEvent.click(screen.getByRole("button", { name: "Sign out" }));

    await waitFor(() => {
      expect(sendJson).toHaveBeenCalledWith("/api/web-auth/logout", { method: "POST" });
    });
    expect(replace).toHaveBeenCalledWith("/login");
    expect(refresh).toHaveBeenCalled();
  });
});
