import type { ReactNode } from "react";
import { SiteFooter } from "./SiteFooter";
import { MobileBottomNav } from "./MobileBottomNav";
import { SiteHeader } from "./SiteHeader";
import { UxProvider } from "../ux/UxProvider";
import type { UserSession } from "../../lib/types";

export function SiteShell({
  user,
  children
}: {
  user: UserSession | null;
  children: ReactNode;
}) {
  return (
    <UxProvider user={user}>
      <SiteHeader user={user} />
      <main className="page-shell">{children}</main>
      <SiteFooter />
      <MobileBottomNav authenticated={Boolean(user)} />
    </UxProvider>
  );
}
