import type { ReactNode } from "react";
import { SiteFooter } from "./SiteFooter";
import { MobileBottomNav } from "./MobileBottomNav";
import { SiteHeader } from "./SiteHeader";
import { GuidedFlowProvider } from "../ux/GuidedFlowProvider";
import { UxProvider } from "../ux/UxProvider";
import type { UserSession } from "../../lib/types";

export function SiteShell({
  user,
  children
}: {
  user: UserSession | null;
  children: ReactNode;
}) {
  const guidedFlowKey = [
    user?.id || "guest",
    user?.familyName || "",
    user?.familyNameSkipped ? "skip" : "keep",
    user?.guidedFlow?.active ? "active" : "idle",
    user?.guidedFlow?.currentStep || 0,
    user?.guidedFlow?.completedAt || "",
    user?.guidedFlow?.exitedAt || ""
  ].join(":");

  return (
    <UxProvider user={user}>
      <GuidedFlowProvider key={guidedFlowKey} user={user}>
        <SiteHeader user={user} />
        <main className="page-shell">{children}</main>
        <SiteFooter />
        <MobileBottomNav authenticated={Boolean(user)} />
      </GuidedFlowProvider>
    </UxProvider>
  );
}
