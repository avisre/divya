import { Hero } from "../../components/content/Hero";
import { Section } from "../../components/content/Section";
import { SupportForm } from "../../components/forms/SupportForm";

export default function ContactUsPage() {
  return (
    <div className="page-stack">
      <Hero
        eyebrow="Contact"
        title="Reach the support team without getting stuck."
        subtitle="Use this page for booking questions, gothram help, technical issues, or general support before you sign in."
      />
      <Section title="Public support form" subtitle="We will respond by email and keep the request aligned to your account when you later sign in.">
        <SupportForm mode="public" />
      </Section>
    </div>
  );
}
