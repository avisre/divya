import { redirect } from "next/navigation";
import { LoginForm } from "../../components/auth/LoginForm";
import { Hero } from "../../components/content/Hero";
import { Section } from "../../components/content/Section";
import { getOptionalSession } from "../../lib/session";

export default async function LoginPage() {
  const session = await getOptionalSession();
  if (session) {
    redirect("/home");
  }

  return (
    <div className="page-stack">
      <Hero
        variant="auth"
        eyebrow="Welcome back"
        title="Sign in to prayers, pujas, and your sacred record."
        subtitle="Your bookings, videos, profile, and support history stay linked to one private account."
        aside={
          <div className="surface-card">
            <h3>What carries over after sign-in</h3>
            <div className="list-stack">
              <div className="list-row"><span>Prayer favorites</span><span>Private</span></div>
              <div className="list-row"><span>Puja bookings</span><span>Tracked live</span></div>
              <div className="list-row"><span>Sacred videos</span><span>Only for you</span></div>
            </div>
          </div>
        }
      />
      <Section title="Secure access" subtitle="Use Google or your email account.">
        <LoginForm />
      </Section>
    </div>
  );
}
