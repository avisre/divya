import { Hero } from "../../components/content/Hero";
import { MetricGrid } from "../../components/content/MetricGrid";
import { Section } from "../../components/content/Section";
import { ProfileForm } from "../../components/forms/ProfileForm";
import { getProfile, getStats } from "../../lib/data";
import { requireSession } from "../../lib/session";

export default async function ProfilePage() {
  const session = await requireSession("/profile");
  const [profile, stats] = await Promise.all([
    getProfile(session.token).catch(() => session.user),
    getStats(session.token).catch(() => null)
  ]);
  const timezoneLabel = profile.timezone?.replace(/_/g, " ") || "Timezone not set";
  const tierLabel = `${profile.subscription?.tier || "free"} tier`;

  return (
    <div className="page-stack">
      <Hero
        variant="profile"
        eyebrow="Profile"
        title={profile.name}
        subtitle={`${tierLabel} ${"\u2022"} ${timezoneLabel}`}
        aside={
          <div className="surface-card">
            <h3>Prayer record</h3>
            <MetricGrid
              items={[
                { label: "Current streak", value: `${profile.streak?.current || 0}` },
                { label: "Prayers completed", value: `${stats?.prayersCompleted || 0}` },
                { label: "Minutes prayed", value: `${stats?.minutesPrayed || 0}` }
              ]}
            />
          </div>
        }
      />
      <Section title="Your rhythm" subtitle="Keep prayer, reminders, and timezone details accurate.">
        <div className="content-grid">
          <div className="surface-card surface-card--feature">
            <h3>Current stats</h3>
            <MetricGrid
              items={[
                { label: "Current streak", value: `${profile.streak?.current || 0}` },
                { label: "Prayers completed", value: `${stats?.prayersCompleted || 0}` },
                { label: "Minutes prayed", value: `${stats?.minutesPrayed || 0}` }
              ]}
            />
          </div>
          <div className="surface-card">
            <h3>Account summary</h3>
            <div className="list-stack">
              <div className="list-row"><span>Email</span><span>{profile.email}</span></div>
              <div className="list-row"><span>Country</span><span>{profile.country || "Not set"}</span></div>
              <div className="list-row"><span>Timezone</span><span>{timezoneLabel}</span></div>
            </div>
          </div>
        </div>
        <ProfileForm user={profile} />
      </Section>
    </div>
  );
}
