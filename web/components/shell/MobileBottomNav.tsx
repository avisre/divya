"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "../../lib/cn";
import { HomeIcon, PrayerIcon, PujaIcon, SessionsIcon, TempleIcon, LotusIcon } from "../ui/Icons";

const navItems = [
  { href: "/home", guestHref: "/", label: "Home", icon: HomeIcon },
  { href: "/prayers", guestHref: "/prayers", label: "Prayers", icon: PrayerIcon },
  { href: "/temple", guestHref: "/temple", label: "Temple", icon: TempleIcon },
  { href: "/learn", guestHref: "/learn", label: "Learn", icon: LotusIcon },
  { href: "/pujas", guestHref: "/pujas", label: "Pujas", icon: PujaIcon },
  { href: "/sessions/create", guestHref: "/login?next=%2Fsessions%2Fcreate", label: "Sessions", icon: SessionsIcon }
];

export function MobileBottomNav({ authenticated }: { authenticated: boolean }) {
  const pathname = usePathname();
  const visibleItems = authenticated
    ? navItems
    : navItems.filter((item) => item.label !== "Sessions");

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile primary">
      {visibleItems.map((item) => {
        const href = authenticated ? item.href : item.guestHref;
        const isActive =
          pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));

        return (
          <Link
            key={item.label}
            href={href}
            className={cn("mobile-bottom-nav__item", isActive && "mobile-bottom-nav__item--active")}
          >
            <item.icon className="mobile-bottom-nav__icon" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
