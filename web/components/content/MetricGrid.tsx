export function MetricGrid({
  items
}: {
  items: Array<{ label: string; value: string }>;
}) {
  return (
    <div className="metric-grid">
      {items.map((item) => (
        <article key={`${item.label}-${item.value}`} className="metric-card">
          <strong>{item.value}</strong>
          <span>{item.label}</span>
        </article>
      ))}
    </div>
  );
}
