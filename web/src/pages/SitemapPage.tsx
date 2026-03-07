import { Link } from "react-router-dom";
import { HeroSection, SectionCard } from "@/components/ui/Surface";

const publicRoutes = [
  { path: "/", label: "Landing" },
  { path: "/home", label: "Home" },
  { path: "/prayers", label: "Prayers" },
  { path: "/temple", label: "Temple" },
  { path: "/pujas", label: "Pujas" },
  { path: "/calendar", label: "Calendar" },
  { path: "/login", label: "Login" },
  { path: "/register", label: "Register" },
  { path: "/contact-us", label: "Contact us" },
  { path: "/privacy", label: "Privacy" },
  { path: "/terms", label: "Terms" },
  { path: "/sitemap", label: "Sitemap" }
];

const accountRoutes = [
  { path: "/bookings", label: "My bookings" },
  { path: "/profile", label: "Profile" },
  { path: "/contact", label: "In-app support form" },
  { path: "/shared-prayer/create", label: "Create shared prayer" }
];

export default function SitemapPage() {
  return (
    <div className="page-stack">
      <HeroSection
        eyebrow="Navigation"
        title="Website sitemap"
        subtitle="All main Divya web routes in one place."
      />

      <SectionCard title="Public routes">
        <div className="list-stack">
          {publicRoutes.map((route) => (
            <Link key={route.path} to={route.path} className="text-link">
              {route.label} ({route.path})
            </Link>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Authenticated routes">
        <div className="list-stack">
          {accountRoutes.map((route) => (
            <div key={route.path} className="event-row">
              <strong>{route.label}</strong>
              <span>{route.path}</span>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
