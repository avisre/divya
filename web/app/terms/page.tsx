import { Hero } from "../../components/content/Hero";
import { Section } from "../../components/content/Section";

export default function TermsPage() {
  return (
    <div className="page-stack">
      <Hero
        eyebrow="Terms"
        title="Use the app reverently and with accurate account details."
        subtitle="These terms cover account access, booking requests, temple coordination, and sacred video delivery."
      />
      <Section title="Core terms" subtitle="The web app reflects real operational constraints of temple coordination.">
        <div className="content-grid">
          <div className="surface-card">
            <h3>Account responsibility</h3>
            <p>You are responsible for keeping your account email current and for submitting accurate devotee details in booking forms.</p>
          </div>
          <div className="surface-card">
            <h3>Puja requests</h3>
            <p>Pujas may remain waitlist-based until the temple team confirms timing. Submission does not guarantee an instant slot.</p>
          </div>
          <div className="surface-card">
            <h3>Video delivery</h3>
            <p>Sacred videos are private account assets. Sharing or reuse outside intended family/devotional use is not permitted.</p>
          </div>
        </div>
      </Section>
    </div>
  );
}
