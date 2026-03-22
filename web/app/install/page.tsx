import type { Metadata } from "next";
import { Hero } from "../../components/content/Hero";
import { Section } from "../../components/content/Section";

export const metadata: Metadata = {
  title: "Install Prarthana",
  description: "Save Prarthana to your home screen on iPhone and Android for one-tap daily access."
};

export default function InstallPage() {
  return (
    <div className="page-stack">
      <Hero
        eyebrow="Install"
        title="Save Prarthana to your home screen"
        subtitle="Keep the daily prayer rhythm one tap away on iPhone and Android."
      />
      <Section
        title="iPhone and iPad"
        subtitle="Safari does not show an install button. Use the share sheet instead."
      >
        <div className="surface-card install-instructions">
          <p>1. Open Prarthana in Safari.</p>
          <p>2. Tap the Share button.</p>
          <p>3. Choose Add to Home Screen.</p>
          <p>4. Save it with the Prarthana name you want on your device.</p>
        </div>
      </Section>
      <Section
        title="Android"
        subtitle="Chrome and most Android browsers can pin Prarthana directly."
      >
        <div className="surface-card install-instructions">
          <p>1. Open Prarthana in Chrome.</p>
          <p>2. Open the browser menu.</p>
          <p>3. Choose Add to Home screen or Install app.</p>
          <p>4. Confirm to keep Prarthana alongside your other apps.</p>
        </div>
      </Section>
    </div>
  );
}
