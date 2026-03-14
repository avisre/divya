import type { Metadata } from "next";
import Link from "next/link";
import { Hero } from "../../components/content/Hero";
import { MetricGrid } from "../../components/content/MetricGrid";
import { Section } from "../../components/content/Section";
import { ProfileForm } from "../../components/forms/ProfileForm";
import { getEarnedMilestoneMap, milestoneDefinitions } from "../../lib/gamification";
import { getProfile, getStats } from "../../lib/data";
import { buildPrivateMetadata } from "../../lib/seo";
import { requireSession } from "../../lib/session";

export const metadata: Metadata = buildPrivateMetadata({
  title: "Profile",
  description: "Private devotional record, rhythm, and reminder settings for your Prarthana account."
});

export default async function ProfilePage() {
  const session = await requireSession("/profile");
  const [profile, stats] = await Promise.all([
    getProfile(session.token).catch(() => session.user),
    getStats(session.token).catch(() => null)
  ]);
  const timezoneLabel = profile.timezone?.replace(/_/g, " ") || "Timezone not set";
  const gamification = profile.gamification || stats;
  const tier = gamification?.tier;
  const earnedMilestones = getEarnedMilestoneMap(gamification?.milestones);

  return (
    <div className="page-stack">
      <Hero
        variant="profile"
        eyebrow="Profile"
        title={profile.name}
        subtitle={`${tier?.icon || "🪷"} ${tier?.key || "SEEKER"} • ${timezoneLabel}`}
        aside={
          <div className="surface-card profile-summary-card profile-tier-card">
            <h3>Your devotional record</h3>
            <div className="profile-tier-card__header">
              <strong>{tier?.icon || "🪷"} {tier?.key || "SEEKER"}</strong>
              <span>{gamification?.totalLotusPoints || 0} lotus points</span>
            </div>
            <div className="practice-progress" aria-label="Progress to next tier">
              <div
                className="practice-progress__value"
                style={{ width: `${tier?.progressPercent || 0}%` }}
              />
            </div>
            <p className="profile-tier-card__next">
              {tier?.nextTier
                ? `${tier.progressPercent}% to ${tier.nextTier.key} (${tier.nextTier.min} pts)`
                : "Highest devotional tier reached."}
            </p>
            <p className="profile-summary-card__note">
              {tier?.description || "Your practice is taking shape."}
            </p>
          </div>
        }
      />
      <Section
        title="Your practice"
        subtitle="Lotus points, prayer rhythm, and learning progress stay visible without turning devotion into competition."
      >
        <div className="page-stack">
          <MetricGrid
            items={[
              { label: "Prayers opened", value: `${gamification?.prayersOpenedCount || 0}`, icon: "🪷" },
              { label: "Family sessions", value: `${gamification?.familySessionsCount || 0}`, icon: "👨‍👩‍👧" },
              { label: "Modules read", value: `${gamification?.modulesCompletedCount || 0}`, icon: "📚" }
            ]}
          />
          <div className="surface-card milestone-panel">
            <div className="section-card__header">
              <div>
                <p className="eyebrow">Milestones</p>
                <h3 className="section-title">Your milestones</h3>
              </div>
            </div>
            <div className="milestone-pill-grid">
              {milestoneDefinitions.map((milestone) => {
                const earned = earnedMilestones.get(milestone.key);
                return (
                  <button
                    key={milestone.key}
                    type="button"
                    className={`milestone-pill ${earned ? "milestone-pill--earned" : "milestone-pill--locked"}`}
                    title={earned ? `${milestone.label} earned` : milestone.requirement}
                  >
                    <span className="milestone-pill__icon" aria-hidden="true">
                      {earned ? milestone.icon : "🔒"}
                    </span>
                    <span>{milestone.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </Section>
      <Section
        title="Your rhythm"
        subtitle="Prayer language, timezone, and reminder preferences live together in one calm card."
      >
        <div className="surface-card rhythm-card">
          <ProfileForm user={profile} />
        </div>
      </Section>
      <Section
        title="Membership"
        subtitle="Plan access and devotional progress stay separate. Practice tier reflects your momentum; membership reflects your unlocked library and family archive access."
      >
        <div className="surface-card profile-membership-card">
          <div>
            <p className="eyebrow">Access plan</p>
            <h3>
              {profile.subscription?.tier === "bhakt"
                ? "Bhakt"
                : profile.subscription?.tier === "seva"
                  ? "Seva"
                  : "Free"}
              {profile.subscription?.interval ? ` · ${profile.subscription.interval}` : ""}
            </h3>
            <p className="muted">
              {profile.subscription?.tier === "free"
                ? "Free keeps the first devotional step open. Bhakt and Seva add deeper prayer access and family archive tools."
                : `Status: ${String(profile.subscription?.status || "active").replace(/_/g, " ")}`}
            </p>
          </div>
          <div className="card-actions">
            <Link href="/plans" className="button button--secondary">
              View plans and billing
            </Link>
          </div>
        </div>
      </Section>
    </div>
  );
}
