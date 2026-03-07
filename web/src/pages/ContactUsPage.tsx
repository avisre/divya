import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HeroSection, SectionCard, StatusStrip } from "@/components/ui/Surface";
import { useAuth } from "@/lib/auth";

export default function ContactUsPage() {
  const { isAuthenticated, continueAsGuest } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState("");

  async function handleGuestSupport() {
    try {
      await continueAsGuest();
      navigate("/contact");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to start guest support right now.");
    }
  }

  return (
    <div className="page-stack">
      <HeroSection
        eyebrow="Support"
        title="Contact Divya support"
        subtitle="For booking help, gothram guidance, account support, and technical issues."
      />

      <SectionCard title="Support channels" subtitle="Fastest path is in-app support so we can attach context automatically.">
        <div className="content-grid">
          <article className="content-card">
            <h3>In-app support</h3>
            <p>Submit a structured support request linked to your account activity.</p>
            {isAuthenticated ? (
              <Link to="/contact" className="btn btn-primary">
                Open support form
              </Link>
            ) : (
              <button type="button" className="btn btn-primary" onClick={() => void handleGuestSupport()}>
                Continue as guest and submit
              </button>
            )}
          </article>
          <article className="content-card">
            <h3>Email</h3>
            <p>If you cannot access the app flow, contact us by email.</p>
            <a className="btn btn-secondary" href="mailto:avinashsreekumar007@gmail.com?subject=Divya%20Support">
              Email support
            </a>
          </article>
        </div>
        <StatusStrip tone="neutral">
          For booking updates, include your booking reference in the message.
        </StatusStrip>
        {status ? <StatusStrip tone="warning">{status}</StatusStrip> : null}
      </SectionCard>
    </div>
  );
}
