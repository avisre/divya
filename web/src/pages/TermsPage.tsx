import { HeroSection, SectionCard } from "@/components/ui/Surface";

export default function TermsPage() {
  return (
    <div className="page-stack">
      <HeroSection
        eyebrow="Legal"
        title="Terms of use"
        subtitle="Conditions for using Divya web, mobile, and connected devotional services."
      />

      <SectionCard title="Service usage">
        <ul>
          <li>Divya is a devotional utility service and not medical, legal, or financial advice</li>
          <li>Users are responsible for account credentials and activity from their account</li>
          <li>Abuse, fraud, and harmful content are not permitted</li>
        </ul>
      </SectionCard>

      <SectionCard title="Booking and media">
        <ul>
          <li>Pujas are coordinated with temple operations and availability</li>
          <li>Waitlist and scheduling updates are provided in-app and by notification/email</li>
          <li>Video/audio media is provided for devotional use and may be subject to tier access</li>
        </ul>
      </SectionCard>

      <SectionCard title="Changes and enforcement">
        <ul>
          <li>Terms may be updated as product and legal requirements evolve</li>
          <li>Continued usage after updates indicates acceptance of revised terms</li>
          <li>Accounts may be restricted for policy violations or security risk</li>
        </ul>
      </SectionCard>
    </div>
  );
}
