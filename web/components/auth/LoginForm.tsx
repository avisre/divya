"use client";

import { useSearchParams, useRouter } from "next/navigation";
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const next = useMemo(() => searchParams.get("next") || "/home", [searchParams]);
  const oauthError = searchParams.get("oauth_error");
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
          await sendJson("/api/auth/login", {
            method: "POST",
            body: JSON.stringify(values)
          });
          router.push(next);
          router.refresh();
        } catch (nextError) {
          setError(nextError instanceof Error ? nextError.message : "Unable to sign in.");
        } finally {
          setPending(false);
        }
      })}
    >
      <GoogleAuthButton returnTo={next} />
      <div className="oauth-divider">or continue with email</div>
      <div className="trust-strip">
        <span>🔒 Encrypted</span>
        <span>🛕 Temple-verified</span>
        <span>🌏 NRI-first</span>
      </div>
      <label className="field">
        <span>Email</span>
        <input type="email" placeholder="you@example.com" {...register("email")} />
      </label>
      <label className="field">
        <span>Password</span>
        <input type="password" placeholder="Your password" {...register("password")} />
      </label>
      {oauthError ? <StatusStrip tone="warning">Google sign-in did not complete. Please try again.</StatusStrip> : null}
      {error ? <StatusStrip tone="warning">{error}</StatusStrip> : null}
      <Button type="submit" block disabled={pending} className={!isValid ? "button--soft-disabled" : ""}>
        {pending ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}
