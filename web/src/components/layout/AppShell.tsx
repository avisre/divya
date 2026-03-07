import type { ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";
import { StickyPlayerBar } from "@/components/player/StickyPlayerBar";
import { FullPlayerDrawer } from "@/components/player/FullPlayerDrawer";
import { useAuth } from "@/lib/auth";

const navItems = [
  { to: "/home", label: "Home", glyph: "\uD83C\uDFE0" },
  { to: "/prayers", label: "Prayers", glyph: "\uD83D\uDCFF" },
  { to: "/temple", label: "Temple", glyph: "\uD83C\uDFDB\uFE0F" },
  { to: "/bookings", label: "My Pujas", glyph: "\uD83E\uDE94" },
  { to: "/profile", label: "Profile", glyph: "\uD83D\uDC64" }
];

export function AppShell({ children }: { children: ReactNode }) {
  const { isAuthenticated, user, logout, continueAsGuest } = useAuth();

  return (
    <div className="app-shell">
      <header className="top-nav">
        <Link to="/home" className="brand-mark">
          <span className="brand-coin">Om</span>
          <div>
            <strong>Divya</strong>
            <span>Bhadra Bhagavathi for the diaspora</span>
          </div>
        </Link>
        <nav className="top-links">
          <NavLink to="/home">Home</NavLink>
          <NavLink to="/prayers">Prayers</NavLink>
          <NavLink to="/temple">Temple</NavLink>
          <NavLink to="/calendar">Calendar</NavLink>
          <NavLink to="/pujas">Pujas</NavLink>
        </nav>
        <div className="top-actions">
          {isAuthenticated ? (
            <>
              <span className="session-chip">{user?.name || "Devotee"}</span>
              <button type="button" className="link-button" onClick={logout}>
                Log out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="link-button">
                Log in
              </NavLink>
              <button type="button" className="cta-chip" onClick={() => void continueAsGuest()}>
                Continue as guest
              </button>
            </>
          )}
        </div>
      </header>
      <main className="page-shell">{children}</main>
      <footer className="legal-footer">
        <div className="footer-brand">
          <strong>Divya web</strong>
          <span>Temple guidance, prayer audio, and sacred booking clarity for families abroad.</span>
        </div>
        <div className="footer-links">
          <NavLink to="/sitemap">Sitemap</NavLink>
          <NavLink to="/privacy">Privacy</NavLink>
          <NavLink to="/terms">Terms</NavLink>
          <NavLink to="/contact-us">Contact us</NavLink>
        </div>
      </footer>
      <nav className="bottom-nav">
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to} className={({ isActive }) => `bottom-link ${isActive ? "active" : ""}`}>
            <span aria-hidden="true">{item.glyph}</span>
            <span className="sr-only">{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <StickyPlayerBar />
      <FullPlayerDrawer />
    </div>
  );
}
