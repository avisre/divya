"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { sendJson } from "../../lib/client-api";
import { GoogleAuthButton } from "./GoogleAuthButton";
import { Button } from "../ui/Button";
import { StatusStrip } from "../ui/StatusStrip";

type LoginValues = {
  email: string;
  password: string;
};

export function LoginForm() {
  const searchParams = useSearchParams();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const next = useMemo(() => searchParams.get("next") || "/home", [searchParams]);
  const oauthError = searchParams.get("oauth_error");
  const resetSuccess = searchParams.get("reset") === "success";
  const { register, handleSubmit, watch } = useForm<LoginValues>({
    defaultValues: { email: "", password: "" }
  });

  const isValid = Boolean(watch("email") && watch("password"));

  return (
    <form
      className="form-stack"
      onSubmit={handleSubmit(async (values) => {
        setPending(true);
        setError("");
        try {
          await sendJson("/api/web-auth/login", {
            method: "POST",
            body: JSON.stringify(values)
          });
          window.location.assign(next);
        } catch (nextError) {
          setError(nextError instanceof Error ? nextError.message : "Unable to sign in.");
        } finally {
          setPending(false);
        }
      })}
    >
      <GoogleAuthButton returnTo={next} />
      <div className="oauth-divider">or continue with email</div>
      <div className="trust-strip trust-strip--auth">
        <span>Encrypted</span>
        <span>Temple-verified</span>
        <span>NRI-first</span>
      </div>
      <label className="field">
        <span>Email</span>
        <input type="email" placeholder="you@example.com" {...register("email")} />
      </label>
      <label className="field">
        <span>Password</span>
        <input type="password" placeholder="Your password" {...register("password")} />
      </label>
      <a href="/forgot-password" className="auth-form__help-link">
        Forgot your password?
      </a>
      {oauthError ? <StatusStrip tone="warning">Google sign-in did not complete. Please try again.</StatusStrip> : null}
      {resetSuccess ? <StatusStrip tone="success">Password updated. Sign in with your new password.</StatusStrip> : null}
      {error ? <StatusStrip tone="warning">{error}</StatusStrip> : null}
      <Button type="submit" block disabled={pending} className={!isValid ? "button--soft-disabled" : ""}>
        {pending ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}
