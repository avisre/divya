import { HeroSection, SectionCard } from "@/components/ui/Surface";

export default function PrivacyPage() {
  return (
    <div className="page-stack">
      <HeroSection
        eyebrow="Legal"
        title="Privacy policy"
        subtitle="How Divya collects, uses, and protects devotional and account data."
      />

      <SectionCard title="What we collect">
        <ul>
          <li>Account details (name, email, timezone, country)</li>
          <li>Prayer preferences, favorites, and streak activity</li>
          <li>Puja booking details (devotee details, intention, booking status)</li>
          <li>Support messages and operational diagnostics</li>
        </ul>
      </SectionCard>

      <SectionCard title="How we use data">
        <ul>
          <li>Deliver prayer, panchang, booking, and support features</li>
          <li>Send requested notifications and booking updates</li>
          <li>Improve reliability, security, and user experience</li>
        </ul>
      </SectionCard>

      <SectionCard title="Data handling and storage">
        <ul>
          <li>Application data is stored in MongoDB Atlas through the backend API</li>
          <li>Access is limited by authentication and role-based controls</li>
          <li>Operational logs are retained for debugging and service safety</li>
        </ul>
      </SectionCard>
    </div>
  );
}
