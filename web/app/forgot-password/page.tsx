import type { Metadata } from "next";
import { Hero } from "../../components/content/Hero";
import { ForgotPasswordForm } from "../../components/auth/ForgotPasswordForm";
import { Section } from "../../components/content/Section";
import { buildPrivateMetadata } from "../../lib/seo";

export const metadata: Metadata = buildPrivateMetadata({
  title: "Forgot password",
  description: "Request a secure password reset link for your Prarthana account."
});

export default function ForgotPasswordPage() {
  return (
    <div className="page-stack">
      <Hero
        eyebrow="Account recovery"
        title="Reset your password securely."
        subtitle="Enter the email address tied to your Prarthana account and we will send a one-time reset link."
      />
      <Section title="Send reset link" subtitle="The link remains active for 60 minutes.">
        <div className="surface-card page-stack">
          <ForgotPasswordForm />
        </div>
      </Section>
    </div>
  );
}
