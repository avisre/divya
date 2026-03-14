import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import LoginPage from "../../app/login/page";
import RegisterPage from "../../app/register/page";

vi.mock("next/navigation", () => ({
  redirect: vi.fn()
}));

vi.mock("../../lib/session", () => ({
  getOptionalSession: vi.fn(async () => null)
}));

vi.mock("../../components/auth/LoginForm", () => ({
  LoginForm: () => <div>login form</div>
}));

vi.mock("../../components/auth/RegisterForm", () => ({
  RegisterForm: () => <div>register form</div>
}));

describe("auth pages", () => {
  it("renders the Devanagari OM glyph on login", async () => {
    render(await LoginPage());

    expect(screen.getByText("\u0950")).toBeInTheDocument();
    expect(screen.queryByText("0950")).not.toBeInTheDocument();
  });

  it("renders the Devanagari OM glyph on register", async () => {
    render(await RegisterPage());

    expect(screen.getByText("\u0950")).toBeInTheDocument();
    expect(screen.queryByText("0950")).not.toBeInTheDocument();
  });
});
