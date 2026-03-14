 "use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutButton } from "../auth/LogoutButton";
import { OmMark } from "../ui/OmMark";
import { PrimaryNav } from "./PrimaryNav";
import type { UserSession } from "../../lib/types";

const publicLinks = [
  { href: "/prayers", label: "Prayers" },
  { href: "/temple", label: "Temple" },
  { href: "/pujas", label: "Pujas" }
];

const authenticatedLinks = [
  { href: "/home", label: "Home" },
  { href: "/prayers", label: "Prayers" },
  { href: "/temple", label: "Temple" },
  { href: "/pujas", label: "Pujas" },
  { href: "/sessions/create", label: "Sessions" }
];

export function SiteHeader({ user }: { user: UserSession | null }) {
  const pathname = usePathname();
  const initial = user?.name?.trim()?.[0]?.toUpperCase() || "P";
  const pageTitle =
    pathname === "/"
      ? "Prarthana"
      : pathname.startsWith("/home")
        ? "Home"
        : pathname.startsWith("/prayers/")
          ? "Prayer"
          : pathname.startsWith("/prayers")
            ? "Prayers"
            : pathname.startsWith("/temple")
              ? "Temple"
              : pathname.startsWith("/pujas/")
                ? "Puja"
                : pathname.startsWith("/pujas")
                  ? "Pujas"
                  : pathname.startsWith("/plans")
                    ? "Plans"
                  : pathname.startsWith("/sessions") || pathname.startsWith("/shared-prayer")
                      ? "Sessions"
                      : pathname.startsWith("/bookings")
                        ? "Bookings"
                        : pathname.startsWith("/profile")
                          ? "Profile"
                          : pathname.startsWith("/onboarding")
                            ? "Onboarding"
                            : "Prarthana";

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link href="/" className="brand">
          <span className="brand__badge" aria-hidden="true">
            <OmMark />
          </span>
          <span>
            <strong>Prarthana</strong>
            <small>Prayer app for families abroad</small>
          </span>
        </Link>
        <div className="site-header__mobile-title" aria-live="polite">
          {pageTitle}
        </div>
        <div className="site-nav-shell">
          <PrimaryNav links={user ? authenticatedLinks : publicLinks} />
        </div>
        <div className="site-header__actions">
          {user ? (
            <details className="account-menu">
              <summary className="account-chip">
                <span className="account-chip__avatar" aria-hidden="true">
                  {initial}
                </span>
                <span className="account-chip__name">{user.name}</span>
              </summary>
              <div className="account-menu__panel">
                <Link href="/bookings" className="account-menu__link">
                  My bookings
                </Link>
                <Link href="/profile" className="account-menu__link">
                  My profile
                </Link>
                <Link href="/plans" className="account-menu__link">
                  Plans & billing
                </Link>
                <Link href="/contact" className="account-menu__link">
                  Account support
                </Link>
                <div className="account-menu__divider" />
                <LogoutButton />
              </div>
            </details>
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
