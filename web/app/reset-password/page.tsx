import type { Metadata } from "next";
import { Hero } from "../../components/content/Hero";
import { ResetPasswordForm } from "../../components/auth/ResetPasswordForm";
import { Section } from "../../components/content/Section";
import { buildPrivateMetadata } from "../../lib/seo";

export const metadata: Metadata = buildPrivateMetadata({
  title: "Reset password",
  description: "Choose a new password for your Prarthana account."
});

export default function ResetPasswordPage() {
  return (
    <div className="page-stack">
      <Hero
        eyebrow="Account recovery"
        title="Choose a new password."
        subtitle="Use the secure reset link from your email to set a fresh password for your account."
      />
      <Section title="Set new password" subtitle="Passwords must be at least 8 characters.">
        <div className="surface-card page-stack">
          <ResetPasswordForm />
        </div>
      </Section>
    </div>
  );
}
