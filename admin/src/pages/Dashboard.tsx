import { useEffect, useState } from "react";
import type { AdminSession } from "../lib/adminApi";
import { getDashboard } from "../lib/adminApi";
import StatsCard from "../components/StatsCard";

type Props = {
  session: AdminSession;
};

export default function Dashboard({ session }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Awaited<ReturnType<typeof getDashboard>> | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    getDashboard(session)
      .then((payload) => {
        if (active) {
          setData(payload);
        }
      })
      .catch((err: unknown) => {
        if (active) {
          setError(err instanceof Error ? err.message : "Failed to load dashboard");
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

  const statusSummary = data?.bookingsByStatus
    ?.map((item) => `${item._id}: ${item.count}`)
    .join(" | ") || "No booking data";

  return (
    <div style={{ display: "grid", gap: 16 }}>
      {error ? (
        <div style={{ padding: 12, borderRadius: 12, border: "1px solid #f0b98e", background: "#fff6ed", color: "#7a3c00" }}>
          {error}
        </div>
      ) : null}
      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
        <StatsCard
          title="Total Bookings"
          value={loading ? "..." : String(data?.bookingsByStatus?.reduce((sum, item) => sum + item.count, 0) ?? 0)}
          subtitle={statusSummary}
        />
        <StatsCard title="Revenue Today" value={loading ? "..." : `$${(data?.revenue.today || 0).toFixed(2)}`} subtitle="USD" />
        <StatsCard title="Video Backlog" value={loading ? "..." : String(data?.videoBacklogCount ?? 0)} subtitle="Completed without video" />
        <StatsCard title="New Waitlist Joins" value={loading ? "..." : String(data?.newWaitlistJoinsToday ?? 0)} subtitle="Today" />
      </div>
      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
        <StatsCard title="Revenue This Week" value={loading ? "..." : `$${(data?.revenue.week || 0).toFixed(2)}`} subtitle="USD" />
        <StatsCard title="Revenue This Month" value={loading ? "..." : `$${(data?.revenue.month || 0).toFixed(2)}`} subtitle="USD" />
      </div>
    </div>
  );
}
