import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { browserTimezone } from "@/lib/time";
import { Button } from "@/components/ui/Button";
import { HeroSection, SectionCard, StatusStrip } from "@/components/ui/Surface";
import { OAuthButtons } from "@/components/forms/OAuthButtons";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register: registerAccount } = useAuth();
  const [error, setError] = useState("");
  const form = useForm<{ name: string; email: string; password: string; country: string }>();

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      setError("");
      await registerAccount({ ...values, timezone: browserTimezone() });
      navigate("/home", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create the account.");
    }
  });

  return (
    <div className="page-stack narrow-stack">
      <HeroSection eyebrow="Create your account" title="Keep prayers, bookings, and reminders in one place" />
      <SectionCard title="Registration">
        <form className="stack-form" onSubmit={onSubmit}>
          <OAuthButtons returnTo="/home" />
          <div className="oauth-divider">or create with email</div>
          <label>
            Name
            <input {...form.register("name")} />
          </label>
          <label>
            Email
            <input type="email" {...form.register("email")} />
          </label>
          <label>
            Password
            <input type="password" {...form.register("password")} />
          </label>
          <label>
            Country
            <input {...form.register("country")} defaultValue="US" />
          </label>
          {error ? <StatusStrip tone="warning">{error}</StatusStrip> : null}
          <Button type="submit" block>
            Create account
          </Button>
          <p className="helper-copy">
            Already have an account? <Link to="/login">Log in</Link>.
          </p>
        </form>
      </SectionCard>
    </div>
  );
}
