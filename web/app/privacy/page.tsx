import { Hero } from "../../components/content/Hero";
import { Section } from "../../components/content/Section";

export default function PrivacyPage() {
  return (
    <div className="page-stack">
      <Hero
        eyebrow="Privacy"
        title="Privacy is part of the product, not a footer afterthought."
        subtitle="The web app uses secure, HttpOnly sessions and keeps devotional data private to your account."
      />
      <Section title="What we store" subtitle="Only the data needed to deliver prayers, bookings, support, and sacred videos.">
        <div className="content-grid">
          <div className="surface-card">
            <h3>Account information</h3>
            <p>Name, email, timezone, country, and reminder preferences are stored to personalize the devotional experience.</p>
          </div>
          <div className="surface-card">
            <h3>Prayer and booking activity</h3>
            <p>Favorites, booking records, support requests, and sacred video access are kept server-side and linked to your account.</p>
          </div>
          <div className="surface-card">
            <h3>Session model</h3>
            <p>The browser does not keep account tokens in visible storage. Web sessions are maintained through secure, HttpOnly cookies.</p>
          </div>
        </div>
      </Section>
    </div>
  );
}
