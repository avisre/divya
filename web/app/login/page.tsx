import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "../../components/auth/LoginForm";
import { Hero } from "../../components/content/Hero";
import { Section } from "../../components/content/Section";
import { buildPrivateMetadata } from "../../lib/seo";
import { getOptionalSession } from "../../lib/session";

export const metadata: Metadata = buildPrivateMetadata({
  title: "Sign in",
  description: "Private sign-in for prayers, pujas, bookings, and sacred recordings."
});

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
        watermark={"\u0950"}
      />
      <Section title="Secure access" subtitle="Use your email account or continue with Google if enabled.">
        <LoginForm />
      </Section>
    </div>
  );
}
