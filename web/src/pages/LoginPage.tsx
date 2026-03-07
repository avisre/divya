import { useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate, Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { HeroSection, SectionCard, StatusStrip } from "@/components/ui/Surface";
import { OAuthButtons } from "@/components/forms/OAuthButtons";
import { useAuth } from "@/lib/auth";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const [error, setError] = useState(() => {
    const oauthError = searchParams.get("oauth_error");
    return oauthError ? `OAuth login failed: ${oauthError.replace(/_/g, " ")}.` : "";
  });
  const { register, handleSubmit } = useForm<{ email: string; password: string }>();
  const from = (location.state as { from?: string } | undefined)?.from || "/home";

  const onSubmit = handleSubmit(async (values) => {
    try {
      setError("");
      await login(values);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to log in.");
    }
  });

  return (
    <div className="page-stack narrow-stack">
      <HeroSection eyebrow="Welcome back" title="Log in to your spiritual journey" subtitle="Continue your prayers, bookings, streak, and family rituals." />
      <SectionCard title="Account access">
        <form className="stack-form" onSubmit={onSubmit}>
          <OAuthButtons returnTo={from} />
          <div className="oauth-divider">or continue with email</div>
          <label>
            Email
            <input type="email" {...register("email")} />
          </label>
          <label>
            Password
            <input type="password" {...register("password")} />
          </label>
          {error ? <StatusStrip tone="warning">{error}</StatusStrip> : null}
          <Button type="submit" block>
            Log in
          </Button>
          <p className="helper-copy">
            Need an account? <Link to="/register">Register here</Link>.
          </p>
        </form>
      </SectionCard>
    </div>
  );
}
