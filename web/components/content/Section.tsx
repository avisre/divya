import type { ReactNode } from "react";

export function Section({
  eyebrow,
  title,
  subtitle,
  children,
  dataTestId
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
  dataTestId?: string;
}) {
  return (
    <section data-testid={dataTestId} className="section-card">
      <div className="section-card__header">
        <div>
          {eyebrow ? <p className="section-label">{eyebrow}</p> : null}
          <h2 className="section-title">{title}</h2>
          {subtitle ? <p className="section-subtitle">{subtitle}</p> : null}
        </div>
      </div>
      <div className="section-card__content">{children}</div>
    </section>
  );
}
