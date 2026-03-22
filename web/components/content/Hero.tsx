import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

export function Hero({
  eyebrow,
  title,
  subtitle,
  actions,
  supportingContent,
  aside,
  variant = "default",
  watermark,
  dataTestId
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  actions?: ReactNode;
  supportingContent?: ReactNode;
  aside?: ReactNode;
  variant?:
    | "default"
    | "landing"
    | "auth"
    | "profile"
    | "temple"
    | "prayer"
    | "puja"
    | "calendar"
    | "shared";
  watermark?: string;
  dataTestId?: string;
}) {
  return (
    <section data-testid={dataTestId} className={cn("hero", `hero--${variant}`, !aside && "hero--single")}>
      <div className="hero__bindu" aria-hidden="true" />
      <div className="hero__watermark" aria-hidden="true">
        {watermark || "\u0950"}
      </div>
      <div className="hero__body">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="hero__title">{title}</h1>
        <p className="hero__subtitle">{subtitle}</p>
        {actions ? <div className="hero__actions">{actions}</div> : null}
        {supportingContent ? <div className="hero__supporting">{supportingContent}</div> : null}
      </div>
      {aside ? <aside className="hero__aside">{aside}</aside> : null}
    </section>
  );
}
