 "use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
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
  const [menuState, setMenuState] = useState<{ open: boolean; pathname: string }>({
    open: false,
    pathname
  });
  const initial = user?.name?.trim()?.[0]?.toUpperCase() || "P";
  const menuOpen = menuState.open && menuState.pathname === pathname;
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

  useEffect(() => {
    if (!menuOpen) return undefined;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuState({ open: false, pathname });
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [menuOpen, pathname]);

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
            <div className="account-menu">
              {menuOpen ? (
                <button
                  type="button"
                  className="account-menu__backdrop"
                  aria-label="Close account menu"
                  onClick={() => setMenuState({ open: false, pathname })}
                />
              ) : null}
              <button
                type="button"
                className="account-chip account-chip--button"
                aria-expanded={menuOpen}
                aria-haspopup="menu"
                onClick={() =>
                  setMenuState((current) =>
                    current.open && current.pathname === pathname
                      ? { open: false, pathname }
                      : { open: true, pathname }
                  )
                }
              >
                <span className="account-chip__avatar" aria-hidden="true">
                  {initial}
                </span>
                <span className="account-chip__name">{user.name}</span>
              </button>
              {menuOpen ? (
                <div className="account-menu__panel" role="menu">
                  <Link
                    href="/bookings"
                    className="account-menu__link"
                    onClick={() => setMenuState({ open: false, pathname })}
                  >
                    My bookings
                  </Link>
                  <Link
                    href="/profile"
                    className="account-menu__link"
                    onClick={() => setMenuState({ open: false, pathname })}
                  >
                    My profile
                  </Link>
                  <Link
                    href="/plans"
                    className="account-menu__link"
                    onClick={() => setMenuState({ open: false, pathname })}
                  >
                    Plans & billing
                  </Link>
                  <Link
                    href="/contact"
                    className="account-menu__link"
                    onClick={() => setMenuState({ open: false, pathname })}
                  >
                    Account support
                  </Link>
                  <div className="account-menu__divider" />
                  <div onClick={() => setMenuState({ open: false, pathname })}>
                    <LogoutButton />
                  </div>
                </div>
              ) : null}
            </div>
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
