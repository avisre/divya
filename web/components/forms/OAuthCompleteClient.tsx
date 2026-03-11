"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { sendJson } from "@/lib/client-api";

export function OAuthCompleteClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("Completing your secure sign-in...");

  useEffect(() => {
    const token = searchParams.get("token");
    const next = searchParams.get("next") || "/home";
    if (!token) {
      router.replace("/login?oauth_error=missing_token");
      return;
    }

    void sendJson<{ next: string }>("/api/auth/oauth/complete", {
      method: "POST",
      body: JSON.stringify({ token, next })
    })
      .then((payload) => {
        setMessage("Redirecting to your account...");
        router.replace(payload.next || next);
        router.refresh();
      })
      .catch(() => {
        router.replace("/login?oauth_error=oauth_callback_failed");
      });
  }, [router, searchParams]);

  return <div className="page-state">{message}</div>;
}
