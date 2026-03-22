"use client";

import { useState } from "react";
import { trackEvent } from "../../lib/analytics";
import { Button } from "../ui/Button";

export function BookingConfirmationActions({
  shareUrl,
  whatsappMessage
}: {
  shareUrl: string;
  whatsappMessage: string;
}) {
  const [copied, setCopied] = useState(false);
  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="card-actions">
      <Button type="button" tone="secondary" onClick={copyLink}>
        {copied ? "Link copied" : "Copy link to this confirmation"}
      </Button>
      <a
        data-testid="whatsapp-share-link"
        href={whatsappHref}
        target="_blank"
        rel="noreferrer"
        className="button button--ghost"
        onClick={() => trackEvent("Share WhatsApp", { context: "booking_confirmation" })}
      >
        Share via WhatsApp
      </a>
    </div>
  );
}
