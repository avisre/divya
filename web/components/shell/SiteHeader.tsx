import Link from "next/link";
import { LogoutButton } from "../auth/LogoutButton";
import { PrimaryNav } from "./PrimaryNav";
import type { UserSession } from "../../lib/types";

const publicLinks = [
  { href: "/prayers", label: "Prayers" },
  { href: "/temple", label: "Temple" },
  { href: "/pujas", label: "Pujas" },
  { href: "/calendar", label: "Calendar" }
];

const authenticatedLinks = [
  { href: "/home", label: "Home" },
  { href: "/bookings", label: "Bookings" },
  { href: "/profile", label: "Profile" }
];

export function SiteHeader({ user }: { user: UserSession | null }) {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link href="/" className="brand">
          <span className="brand__badge">{"\u0950"}</span>
          <span>
            <strong>Divya</strong>
            <small>Prayer app for families abroad</small>
          </span>
        </Link>
        <div className="site-nav-shell">
          <PrimaryNav links={[...(user ? authenticatedLinks : []), ...publicLinks]} />
        </div>
        <div className="site-header__actions">
          {user ? (
            <>
              <span className="account-chip">{user.name}</span>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="button button--secondary">
                Sign in
              </Link>
              <Link href="/register" className="button button--primary">
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
