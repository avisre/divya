import type { ReactNode } from "react";
import { SiteFooter } from "@/components/shell/SiteFooter";
import { SiteHeader } from "@/components/shell/SiteHeader";
import type { UserSession } from "@/lib/types";

export function SiteShell({
  user,
  children
}: {
  user: UserSession | null;
  children: ReactNode;
}) {
  return (
    <>
      <SiteHeader user={user} />
      <main className="page-shell">{children}</main>
      <SiteFooter />
    </>
  );
}
