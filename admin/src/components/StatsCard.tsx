type Props = {
  title: string;
  value: string;
  subtitle: string;
};

export default function StatsCard({ title, value, subtitle }: Props) {
  return (
    <article
      style={{
        background: "#ffffff",
        borderRadius: 24,
        padding: 24,
        border: "1px solid #f0dfbf",
      }}
    >
      <div style={{ color: "#8f4b00", fontSize: 14 }}>{title}</div>
      <div style={{ fontSize: 32, fontWeight: 700, margin: "8px 0" }}>{value}</div>
      <div style={{ opacity: 0.7 }}>{subtitle}</div>
    </article>
  );
}
