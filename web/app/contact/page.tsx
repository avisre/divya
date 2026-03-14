import type { Metadata } from "next";
import { Hero } from "../../components/content/Hero";
import { Section } from "../../components/content/Section";
import { SupportForm } from "../../components/forms/SupportForm";
import { buildPrivateMetadata } from "../../lib/seo";
import { requireSession } from "../../lib/session";

export const metadata: Metadata = buildPrivateMetadata({
  title: "Account support",
  description: "Private account support for bookings, temple coordination, and devotional guidance."
});

export default async function ContactPage({
  searchParams
}: {
  searchParams: Promise<{ bookingReference?: string }>;
}) {
  const [session, query] = await Promise.all([requireSession("/contact"), searchParams]);
  const bookingReference = typeof query?.bookingReference === "string" ? query.bookingReference : "";

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
            email: session.user.email,
            bookingReference,
            subject: bookingReference ? `Question about booking ${bookingReference}` : ""
          }}
        />
      </Section>
    </div>
  );
}
