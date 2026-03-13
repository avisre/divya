import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

export function Hero({
  eyebrow,
  title,
  subtitle,
  actions,
  aside,
  variant = "default"
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  actions?: ReactNode;
  aside?: ReactNode;
  variant?: "default" | "auth" | "profile";
}) {
  return (
    <section className={cn("hero", `hero--${variant}`)}>
      <div className="hero__body">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="hero__title">{title}</h1>
        <p className="hero__subtitle">{subtitle}</p>
        {actions ? <div className="hero__actions">{actions}</div> : null}
      </div>
      {aside ? <aside className="hero__aside">{aside}</aside> : null}
    </section>
  );
}
