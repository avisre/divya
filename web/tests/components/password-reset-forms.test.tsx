import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { ForgotPasswordForm } from "../../components/auth/ForgotPasswordForm";
import { ResetPasswordForm } from "../../components/auth/ResetPasswordForm";

const push = vi.fn();
const sendJson = vi.fn();
let searchParams = new URLSearchParams();

vi.mock("../../lib/client-api", () => ({
  sendJson: (...args: unknown[]) => sendJson(...args)
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push,
    refresh: vi.fn()
  }),
  useSearchParams: () => searchParams
}));

describe("password reset forms", () => {
  beforeEach(() => {
    push.mockReset();
    sendJson.mockReset();
    searchParams = new URLSearchParams();
  });

  it("submits forgot-password email and shows confirmation", async () => {
    sendJson.mockResolvedValue({
      message: "If an account exists for that email, a password reset link has been sent."
    });

    render(<ForgotPasswordForm />);
    fireEvent.change(screen.getByPlaceholderText("you@example.com"), {
      target: { value: "devotee@example.com" }
    });
    fireEvent.click(screen.getByRole("button", { name: "Send reset link" }));

    await waitFor(() => {
      expect(sendJson).toHaveBeenCalledWith("/api/web-auth/forgot-password", expect.any(Object));
      expect(screen.getByText(/password reset link has been sent/i)).toBeInTheDocument();
    });
  });

  it("validates reset-password token presence", () => {
    render(<ResetPasswordForm />);
    expect(screen.getByText(/reset link is incomplete/i)).toBeInTheDocument();
  });

  it("submits a valid reset and redirects to login", async () => {
    searchParams = new URLSearchParams("token=reset-token");
    sendJson.mockResolvedValue({ message: "Password updated successfully." });

    render(<ResetPasswordForm />);
    fireEvent.change(screen.getByPlaceholderText("At least 8 characters"), {
      target: { value: "NewPass123" }
    });
    fireEvent.change(screen.getByPlaceholderText("Retype your password"), {
      target: { value: "NewPass123" }
    });
    fireEvent.click(screen.getByRole("button", { name: "Update password" }));

    await waitFor(() => {
      expect(sendJson).toHaveBeenCalledWith("/api/web-auth/reset-password", expect.any(Object));
      expect(push).toHaveBeenCalledWith("/login?reset=success");
    });
  });
});

