"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { redirectToExternal } from "../../lib/browser";
import { sendJson } from "../../lib/client-api";
import {
  canManageSubscription,
  formatBillingPrice,
  getBillingPrice
} from "../../lib/subscription-plans";
import type { BillingCatalog, BillingInterval, Subscription } from "../../lib/types";
import { Button } from "../ui/Button";
import { StatusStrip } from "../ui/StatusStrip";

type StripeRedirectResponse = {
  id: string;
  url: string;
};

function subscriptionStatusLabel(subscription?: Subscription | null) {
  const raw = String(subscription?.status || "inactive").trim().toLowerCase();
  if (!raw || raw === "inactive") return "No active paid plan yet.";
  return raw.replace(/_/g, " ");
}

export function BillingPlansClient({
  catalog,
  authenticated,
  subscription
}: {
  catalog: BillingCatalog;
  authenticated: boolean;
  subscription?: Subscription | null;
}) {
  const searchParams = useSearchParams();
  const [interval, setInterval] = useState<BillingInterval>("month");
  const [status, setStatus] = useState<string>("");
  const [pendingKey, setPendingKey] = useState<string>("");

  const checkoutState = searchParams.get("checkout");
  const managePaidSubscription = useMemo(() => canManageSubscription(subscription), [subscription]);
  const currentTier = subscription?.tier || "free";

  async function handleCheckout(tier: "bhakt" | "seva") {
    if (!authenticated) return;
    setPendingKey(`${tier}:${interval}`);
    setStatus("");
    try {
      const result = await sendJson<StripeRedirectResponse>("/api/backend/billing/checkout-session", {
        method: "POST",
        body: JSON.stringify({
          tier,
          interval,
          successPath: "/plans?checkout=success",
          cancelPath: "/plans?checkout=cancelled"
        })
      });
      redirectToExternal(result.url);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to start Stripe checkout.");
      setPendingKey("");
    }
  }

  async function handlePortal() {
    setPendingKey("portal");
    setStatus("");
    try {
      const result = await sendJson<StripeRedirectResponse>("/api/backend/billing/portal-session", {
        method: "POST",
        body: JSON.stringify({
          returnPath: "/plans"
        })
      });
      redirectToExternal(result.url);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to open Stripe billing management.");
      setPendingKey("");
    }
  }

  return (
    <div className="page-stack">
      {checkoutState === "success" ? (
        <StatusStrip tone="success">
          Checkout completed. Stripe will return your access as soon as the subscription webhook settles.
        </StatusStrip>
      ) : null}
      {checkoutState === "cancelled" ? (
        <StatusStrip tone="warning">
          Checkout was cancelled. Your current access stays unchanged.
        </StatusStrip>
      ) : null}
      {!catalog.enabled || !catalog.subscriptionsConfigured ? (
        <StatusStrip tone="warning">
          Stripe billing is not fully configured in this environment yet. The plans are visible, but paid checkout is disabled until the live price IDs are connected.
        </StatusStrip>
      ) : null}
      {status ? <StatusStrip tone="warning">{status}</StatusStrip> : null}

      <div className="billing-header">
        <div>
          <p className="eyebrow">Membership</p>
          <h2 className="section-title">Choose the plan that fits your family&apos;s rhythm.</h2>
          <p className="section-subtitle">
            Start free, move to Bhakt for a daily habit, or use Seva for the full archive and deeper family access.
          </p>
        </div>
        <div className="billing-cycle-toggle" role="tablist" aria-label="Billing cycle">
          <button
            type="button"
            className={interval === "month" ? "billing-cycle-toggle__pill billing-cycle-toggle__pill--active" : "billing-cycle-toggle__pill"}
            onClick={() => setInterval("month")}
          >
            Monthly
          </button>
          <button
            type="button"
            className={interval === "year" ? "billing-cycle-toggle__pill billing-cycle-toggle__pill--active" : "billing-cycle-toggle__pill"}
            onClick={() => setInterval("year")}
          >
            Annual
          </button>
        </div>
      </div>

      {authenticated ? (
        <div className="surface-card billing-summary-card">
          <div>
            <p className="eyebrow">Current membership</p>
            <h3>
              {currentTier === "free"
                ? "Free"
                : `${currentTier === "bhakt" ? "Bhakt" : "Seva"}${subscription?.interval ? ` · ${subscription.interval}` : ""}`}
            </h3>
            <p className="muted">
              Status: {subscriptionStatusLabel(subscription)}
              {subscription?.cancelAtPeriodEnd && subscription?.currentPeriodEnd
                ? ` · ends after ${new Date(subscription.currentPeriodEnd).toLocaleDateString("en-GB")}`
                : ""}
            </p>
          </div>
          {managePaidSubscription ? (
            <div className="card-actions">
              <Button type="button" tone="secondary" onClick={handlePortal} disabled={pendingKey === "portal"}>
                {pendingKey === "portal" ? "Opening Stripe..." : "Manage in Stripe"}
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="billing-grid">
        {catalog.plans.map((plan) => {
          const price = getBillingPrice(plan, interval);
          const isCurrentTier = currentTier === plan.tier;
          const checkoutDisabled = !catalog.enabled || !catalog.subscriptionsConfigured || !price?.active;
          const actionKey = `${plan.tier}:${interval}`;

          return (
            <article
              key={plan.tier}
              className={`surface-card billing-plan-card ${isCurrentTier ? "billing-plan-card--current" : ""}`}
            >
              <div className="surface-card__meta">
                <span className="pill pill--soft">{plan.name}</span>
                {plan.badge ? <span className="muted">{plan.badge}</span> : null}
              </div>
              <h3>{plan.name}</h3>
              <p>{plan.summary}</p>
              {price ? (
                <div className="billing-plan-card__price">
                  <strong>{formatBillingPrice(price)}</strong>
                  <span>/{interval === "year" ? "year" : "month"}</span>
                </div>
              ) : (
                <div className="billing-plan-card__price">
                  <strong>£0.00</strong>
                  <span>to begin</span>
                </div>
              )}
              {price?.savingsLabel ? <p className="billing-plan-card__savings">{price.savingsLabel}</p> : null}
              <ul className="card-list billing-plan-card__perks">
                {plan.perks.map((perk) => (
                  <li key={perk}>{perk}</li>
                ))}
              </ul>
              <p className="muted">{plan.footnote}</p>
              <div className="card-actions">
                {!authenticated ? (
                  <Button href={`/register?next=${encodeURIComponent("/plans")}`} block>
                    Create account to subscribe
                  </Button>
                ) : plan.tier === "free" ? (
                  <Button type="button" tone="secondary" block disabled>
                    {isCurrentTier ? "Current plan" : "Free access included"}
                  </Button>
                ) : managePaidSubscription ? (
                  <Button type="button" tone={isCurrentTier ? "secondary" : "primary"} block onClick={handlePortal}>
                    {isCurrentTier ? "Manage current plan" : "Change plan in Stripe"}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    block
                    onClick={() => handleCheckout(plan.tier as "bhakt" | "seva")}
                    disabled={checkoutDisabled || pendingKey === actionKey}
                  >
                    {pendingKey === actionKey ? "Redirecting..." : plan.cta}
                  </Button>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
