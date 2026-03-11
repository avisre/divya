import { redirect } from "next/navigation";
import { RegisterForm } from "../../components/auth/RegisterForm";
import { Hero } from "../../components/content/Hero";
import { Section } from "../../components/content/Section";
import { getOptionalSession } from "../../lib/session";

export default async function RegisterPage() {
  const session = await getOptionalSession();
  if (session) {
    redirect("/home");
  }

  return (
    <div className="page-stack">
      <Hero
        variant="auth"
        eyebrow="Create your account"
        title="Start a devotional routine that works across timezones."
        subtitle="Set up a secure account for prayer guidance, temple offerings, festival preparation, and support."
        aside={
          <div className="surface-card">
            <h3>Why registration matters</h3>
            <div className="list-stack">
              <div className="list-row"><span>Timezone-aware prayer rhythm</span><span>Daily</span></div>
              <div className="list-row"><span>Private booking history</span><span>Persistent</span></div>
              <div className="list-row"><span>Shared prayer sessions</span><span>Family-ready</span></div>
            </div>
          </div>
        }
      />
      <Section title="Create access" subtitle="Email sign-up and Google sign-up are both supported.">
        <RegisterForm />
      </Section>
    </div>
  );
}
