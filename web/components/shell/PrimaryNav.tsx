"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

export function PrimaryNav({
  links
}: {
  links: Array<{ href: string; label: string }>;
}) {
  const pathname = usePathname();

  return (
    <nav className="site-nav" aria-label="Primary">
      {links.map((link) => {
        const isActive =
          pathname === link.href ||
          (link.href !== "/" && pathname.startsWith(`${link.href}/`));

        return (
          <Link
            key={`${link.href}-${link.label}`}
            href={link.href}
            className={cn("site-nav__link", isActive && "site-nav__link--active")}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
