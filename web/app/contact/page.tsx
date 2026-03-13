import { Hero } from "../../components/content/Hero";
import { Section } from "../../components/content/Section";
import { SupportForm } from "../../components/forms/SupportForm";
import { requireSession } from "../../lib/session";

export default async function ContactPage() {
  const session = await requireSession("/contact");

  return (
    <div className="page-stack">
      <Hero
        eyebrow="Support"
        title="Tell us what you need help with."
        subtitle="Structured support requests help the temple and product team respond with the right context."
      />
      <Section title="Account support" subtitle="We respond in your timezone and keep the request tied to your account.">
        <SupportForm
          defaults={{
            name: session.user.name,
            email: session.user.email
          }}
        />
      </Section>
    </div>
  );
}
