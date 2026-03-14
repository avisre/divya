import type { Metadata } from "next";
import { BillingPlansClient } from "../../components/content/BillingPlansClient";
import { Hero } from "../../components/content/Hero";
import { Section } from "../../components/content/Section";
import { Button } from "../../components/ui/Button";
import { getBillingPlans } from "../../lib/data";
import { buildPublicMetadata } from "../../lib/seo";
import { getOptionalSession } from "../../lib/session";
import { buildStaticBillingCatalog } from "../../lib/subscription-plans";

export const metadata: Metadata = buildPublicMetadata({
  title: "Plans | Prarthana",
  description:
    "Compare Free, Bhakt, and Seva plans for guided prayer access, temple-connected waitlists, sacred recordings, and family devotional continuity.",
  path: "/plans"
});

export default async function PlansPage() {
  const session = await getOptionalSession();
  const catalog = await getBillingPlans(session?.token).catch(() => buildStaticBillingCatalog());

  return (
    <div className="page-stack">
      <Hero
        eyebrow="Plans"
        title="Free to begin. Paid only when your family wants deeper access."
        subtitle="Prarthana keeps the first step open, then offers Bhakt and Seva for households that want more prayers, stronger continuity, and a sacred archive."
        actions={
          session ? (
            <Button href="/profile" tone="secondary">
              Back to profile
            </Button>
          ) : (
            <>
              <Button href="/register">Create account</Button>
              <Button href="/login" tone="secondary">
                Sign in
              </Button>
            </>
          )
        }
      />

      <Section
        title="Membership tiers"
        subtitle="The pricing stays simple: one free path, two paid memberships, and a discounted annual option for families who already know they will stay."
      >
        <BillingPlansClient
          catalog={catalog}
          authenticated={Boolean(session)}
          subscription={session?.user.subscription || null}
        />
      </Section>
    </div>
  );
}
