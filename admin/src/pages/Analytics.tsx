import { useEffect, useState } from "react";
import type { AdminSession } from "../lib/adminApi";
import { getAnalytics } from "../lib/adminApi";
import StatsCard from "../components/StatsCard";

type Props = {
  session: AdminSession;
};

export default function Analytics({ session }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Awaited<ReturnType<typeof getAnalytics>> | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    getAnalytics(session)
      .then((payload) => {
        if (active) {
          setData(payload);
        }
      })
      .catch((err: unknown) => {
        if (active) {
          setError(err instanceof Error ? err.message : "Failed to load analytics");
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [session]);

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <h1>Analytics</h1>
      {error ? (
        <div style={{ padding: 12, borderRadius: 12, border: "1px solid #f0b98e", background: "#fff6ed", color: "#7a3c00" }}>
          {error}
        </div>
      ) : null}
      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
        <StatsCard
          title="Prayer Completion Rate"
          value={loading ? "..." : `${((data?.prayerCompletionRate || 0) * 100).toFixed(1)}%`}
          subtitle="Last 30 days"
        />
        <StatsCard
          title="Video Watch Rate"
          value={loading ? "..." : `${((data?.videoWatchRate || 0) * 100).toFixed(1)}%`}
          subtitle="Last 30 days"
        />
        <StatsCard
          title="Puja Funnel Started"
          value={loading ? "..." : String(data?.pujaFunnel.started ?? 0)}
          subtitle={`Viewed ${data?.pujaFunnel.viewed ?? 0} | Paid ${data?.pujaFunnel.paid ?? 0}`}
        />
      </div>
      <div style={{ border: "1px solid #e9d6b5", borderRadius: 12, padding: 16, background: "#fffaf4" }}>
        <h2 style={{ marginTop: 0 }}>DAU / WAU by Country</h2>
        {loading ? (
          <p>Loading...</p>
        ) : (data?.dauWauByCountry || []).length === 0 ? (
          <p>No activity data yet.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", paddingBottom: 8 }}>Country</th>
                <th style={{ textAlign: "left", paddingBottom: 8 }}>DAU</th>
                <th style={{ textAlign: "left", paddingBottom: 8 }}>WAU</th>
              </tr>
            </thead>
            <tbody>
              {data?.dauWauByCountry.map((row) => (
                <tr key={row.country}>
                  <td style={{ padding: "6px 0" }}>{row.country}</td>
                  <td style={{ padding: "6px 0" }}>{row.dau}</td>
                  <td style={{ padding: "6px 0" }}>{row.wau}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
