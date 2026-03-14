import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { RegisterForm } from "../../components/auth/RegisterForm";
import { Hero } from "../../components/content/Hero";
import { Section } from "../../components/content/Section";
import { buildPrivateMetadata } from "../../lib/seo";
import { getOptionalSession } from "../../lib/session";

export const metadata: Metadata = buildPrivateMetadata({
  title: "Create account",
  description: "Private account creation for prayer guidance, temple offerings, recordings, and family ritual support."
});

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
        watermark={"\u0950"}
      />
      <Section title="Create access" subtitle="Use email first, then shape your devotional rhythm after sign-up.">
        <RegisterForm />
      </Section>
    </div>
  );
}
