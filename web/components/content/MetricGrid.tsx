export function MetricGrid({
  items
}: {
  items: Array<{ label: string; value: string; helper?: string; icon?: string }>;
}) {
  return (
    <div className="metric-grid">
      {items.map((item) => (
        <article key={`${item.label}-${item.value}`} className="metric-card">
          {item.icon ? <span className="metric-card__icon">{item.icon}</span> : null}
          <strong>{item.value}</strong>
          <span>{item.label}</span>
          {item.helper ? <small>{item.helper}</small> : null}
        </article>
      ))}
    </div>
  );
}
