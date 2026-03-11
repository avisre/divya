import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

export function StatusStrip({
  children,
  tone = "neutral"
}: {
  children: ReactNode;
  tone?: "neutral" | "success" | "warning";
}) {
  return <div className={cn("status-strip", `status-strip--${tone}`)}>{children}</div>;
}
