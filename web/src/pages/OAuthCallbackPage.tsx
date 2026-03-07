import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { HeroSection, SectionCard, StatusStrip } from "@/components/ui/Surface";
import { useAuth } from "@/lib/auth";

function safeNext(value: string | null) {
  if (!value) return "/home";
  if (!value.startsWith("/") || value.startsWith("//")) return "/home";
  return value;
}

export default function OAuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { completeOAuth } = useAuth();
  const [status, setStatus] = useState<"loading" | "error">("loading");
  const [message, setMessage] = useState("Completing secure sign-in...");

  useEffect(() => {
    let active = true;
    const token = searchParams.get("token");
    const next = safeNext(searchParams.get("next"));
    const oauthError = searchParams.get("oauth_error");

    async function run() {
      if (oauthError) {
        if (!active) return;
        setStatus("error");
        setMessage(`OAuth sign-in failed: ${oauthError.replace(/_/g, " ")}.`);
        return;
      }
      if (!token) {
        if (!active) return;
        setStatus("error");
        setMessage("OAuth sign-in failed: missing token.");
        return;
      }
      try {
        await completeOAuth(token);
        if (!active) return;
        navigate(next, { replace: true });
      } catch (error) {
        if (!active) return;
        setStatus("error");
        setMessage(error instanceof Error ? error.message : "OAuth sign-in failed.");
      }
    }

    void run();
    return () => {
      active = false;
    };
  }, [completeOAuth, navigate, searchParams]);

  return (
    <div className="page-stack narrow-stack">
      <HeroSection eyebrow="OAuth" title="Signing you in securely" subtitle="Please wait while we validate your account." />
      <SectionCard title="Sign-in status">
        {status === "loading" ? (
          <StatusStrip tone="neutral">{message}</StatusStrip>
        ) : (
          <StatusStrip tone="warning">{message}</StatusStrip>
        )}
      </SectionCard>
    </div>
  );
}

