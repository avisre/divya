import type { PropsWithChildren, ReactNode } from "react";

export function HeroSection({
  eyebrow,
  title,
  subtitle,
  actions,
  children
}: PropsWithChildren<{
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}>) {
  return (
    <section className="hero-surface">
      <div className="hero-copy">
        {eyebrow ? <div className="eyebrow">{eyebrow}</div> : null}
        <h1>{title}</h1>
        {subtitle ? <p className="hero-subtitle">{subtitle}</p> : null}
        {actions ? <div className="hero-actions">{actions}</div> : null}
      </div>
      {children ? <div className="hero-side">{children}</div> : null}
    </section>
  );
}

export function SectionCard({
  title,
  subtitle,
  actions,
  children
}: PropsWithChildren<{
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}>) {
  return (
    <section className="section-card">
      <div className="section-head">
        <div>
          <h2>{title}</h2>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
        {actions ? <div className="section-actions">{actions}</div> : null}
      </div>
      <div className="section-body">{children}</div>
    </section>
  );
}

export function DividerLabel({ children }: PropsWithChildren) {
  return <div className="divider-label">{children}</div>;
}

export function StatusStrip({ tone = "neutral", children }: PropsWithChildren<{ tone?: "neutral" | "success" | "warning" }>) {
  return <div className={`status-strip status-${tone}`}>{children}</div>;
}

export function InfoNote({ children }: PropsWithChildren) {
  return <div className="info-note">{children}</div>;
}

export function FilterChip({
  active,
  onClick,
  children
}: PropsWithChildren<{ active?: boolean; onClick?: () => void }>) {
  return (
    <button type="button" className={`filter-chip ${active ? "active" : ""}`} onClick={onClick}>
      {children}
    </button>
  );
}
