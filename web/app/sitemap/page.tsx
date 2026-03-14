import Link from "next/link";
import { Hero } from "../../components/content/Hero";
import { Section } from "../../components/content/Section";

const publicRoutes = [
  ["/", "Landing"],
  ["/login", "Login"],
  ["/register", "Register"],
  ["/prayers", "Prayers"],
  ["/temple", "Temple"],
  ["/pujas", "Pujas"],
  ["/contact-us", "Contact"],
  ["/privacy", "Privacy"],
  ["/terms", "Terms"]
];

const privateRoutes = [
  ["/home", "Home"],
  ["/bookings", "Bookings"],
  ["/profile", "Profile"],
  ["/contact", "Account support"],
  ["/shared-prayer/create", "Create shared prayer"]
];

export default function SitemapPage() {
  return (
    <div className="page-stack">
      <Hero
        eyebrow="Sitemap"
        title="Every public and account route in one place."
        subtitle="Use this page to audit the consumer route surface of the new web app."
      />
      <Section title="Public routes" subtitle="Pages available without signing in.">
        <div className="content-grid">
          {publicRoutes.map(([href, label]) => (
            <div key={href} className="surface-card">
              <h3>{label}</h3>
              <Link href={href}>{href}</Link>
            </div>
          ))}
        </div>
      </Section>
      <Section title="Account routes" subtitle="These require a valid web session.">
        <div className="content-grid">
          {privateRoutes.map(([href, label]) => (
            <div key={href} className="surface-card">
              <h3>{label}</h3>
              <span>{href}</span>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
