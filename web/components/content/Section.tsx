import type { ReactNode } from "react";

export function Section({
  title,
  subtitle,
  children
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <section className="section-card">
      <div className="section-card__header">
        <div>
          <p className="section-label">{title}</p>
          {subtitle ? <h2 className="section-title">{subtitle}</h2> : null}
        </div>
      </div>
      <div className="section-card__content">{children}</div>
    </section>
  );
}
