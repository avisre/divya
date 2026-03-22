import type { Metadata } from "next";
import { Hero } from "../../components/content/Hero";
import { Section } from "../../components/content/Section";
import { WelcomeDismissButton } from "../../components/ux/WelcomeDismissButton";
import { WelcomePageTracker } from "../../components/ux/WelcomePageTracker";
import { Button } from "../../components/ui/Button";
import { getPanchangToday } from "../../lib/data";
import { buildPrivateMetadata } from "../../lib/seo";
import { requireSession } from "../../lib/session";

export const metadata: Metadata = buildPrivateMetadata({
  title: "Welcome",
  description: "A calm first step into prayers, panchang, and temple offerings after signup."
});

function buildTithiMeaningLine(tithiName: string, summary?: string | null) {
  if (summary) {
    return `Today is ${tithiName}. ${summary}`;
  }
  return `Today is ${tithiName}. A steady day to begin with prayer and sacred timing.`;
}

export default async function WelcomePage() {
  const session = await requireSession("/welcome");
  const timezone = session.user.timezone || "Asia/Kolkata";
  const panchang = await getPanchangToday(timezone).catch(() => null);
  const firstName = session.user.name.split(" ")[0] || session.user.name;
  const tithiName = panchang?.tithi?.name || "today's tithi";
  const tithiLine = buildTithiMeaningLine(tithiName, panchang?.dailyGuidance?.overall || panchang?.infoTooltip);

  const cards = [
    {
      title: "Explore prayers",
      body: "Start with the Gayatri Mantra or Mahishasura Mardini Stotram. Audio guidance included.",
      cta: "Open prayer library ->",
      href: "/prayers"
    },
    {
      title: "Check today's panchang",
      body: tithiLine,
      cta: "See today's timing ->",
      href: "/home"
    },
    {
      title: "Book a puja for your family",
      body: "Abhishekam, Sahasranama Archana, and Kalasha Puja are available now.",
      cta: "Browse offerings ->",
      href: "/pujas"
    }
  ];

  return (
    <div className="page-stack">
      <WelcomePageTracker userId={session.user.id} />
      <Hero
        eyebrow="Welcome"
        title={`Namaste, ${firstName}.`}
        subtitle="Your account is ready. Here is where to begin."
      />
      <Section title="Begin here" subtitle="Choose the first path that matches your family's rhythm today.">
        <div className="welcome-activation" data-testid="welcome-screen">
          {cards.map((card) => (
            <article key={card.title} className="surface-card welcome-activation__card" data-testid="welcome-option-card">
              <h2>{card.title}</h2>
              <p>{card.body}</p>
              <div className="card-actions">
                <Button href={card.href}>{card.cta}</Button>
              </div>
            </article>
          ))}
        </div>
        <p className="welcome-activation__footer">
          Your account is free to keep. Upgrade any time when your family wants more.
        </p>
        <div className="card-actions">
          <WelcomeDismissButton />
        </div>
      </Section>
    </div>
  );
}
