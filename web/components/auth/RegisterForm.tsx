"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { sendJson } from "@/lib/client-api";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";
import { Button } from "@/components/ui/Button";
import { StatusStrip } from "@/components/ui/StatusStrip";

type RegisterValues = {
  name: string;
  email: string;
  password: string;
  country: string;
  timezone: string;
};

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const next = useMemo(() => searchParams.get("next") || "/home", [searchParams]);
  const deviceTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const { register, handleSubmit, watch } = useForm<RegisterValues>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      country: "US",
      timezone: deviceTimezone
    }
  });

  const isValid = Boolean(watch("name") && watch("email") && (watch("password") || "").length >= 8);

  return (
    <form
      className="form-stack"
      onSubmit={handleSubmit(async (values) => {
        setPending(true);
        setError("");
        try {
          await sendJson("/api/auth/register", {
            method: "POST",
            body: JSON.stringify(values)
          });
          router.push(next);
          router.refresh();
        } catch (nextError) {
          setError(nextError instanceof Error ? nextError.message : "Unable to create account.");
        } finally {
          setPending(false);
        }
      })}
    >
      <GoogleAuthButton returnTo={next} />
      <div className="oauth-divider">or create your account with email</div>
      <div className="trust-strip">
        <span>Free to start</span>
        <span>Timezone-aware reminders</span>
      </div>
      <label className="field">
        <span>Name</span>
        <input placeholder="Your full name" {...register("name")} />
      </label>
      <label className="field">
        <span>Email</span>
        <input type="email" placeholder="you@example.com" {...register("email")} />
      </label>
      <label className="field">
        <span>Password</span>
        <input type="password" placeholder="At least 8 characters" {...register("password")} />
      </label>
      <label className="field">
        <span>Country</span>
        <input placeholder="United States" {...register("country")} />
      </label>
      <label className="field">
        <span>Timezone</span>
        <input placeholder="America/New_York" {...register("timezone")} />
      </label>
      {error ? <StatusStrip tone="warning">{error}</StatusStrip> : null}
      <Button type="submit" block disabled={pending} className={!isValid ? "button--soft-disabled" : ""}>
        {pending ? "Creating account..." : "Create account"}
      </Button>
    </form>
  );
}
