import type { Panchang } from "../../lib/types";

export function PanchangSummary({ panchang }: { panchang: Panchang }) {
  return (
    <article className="surface-card">
      <div className="surface-card__meta">
        <span className="pill">Today's panchang</span>
        <span className="muted">{panchang.timezone}</span>
      </div>
      <h3>
        {panchang.tithi.name}
        {panchang.tithi.paksha ? ` • ${panchang.tithi.paksha}` : ""}
      </h3>
      <p>{panchang.dailyGuidance?.overall || "Daily timing guidance is available for your timezone."}</p>
      <div className="stat-row">
        <div>
          <strong>{panchang.nakshatra.name}</strong>
          <span>Nakshatra</span>
        </div>
        <div>
          <strong>
            {panchang.rahuKaal?.start || "--"} to {panchang.rahuKaal?.end || "--"}
          </strong>
          <span>Rahu Kaal</span>
        </div>
      </div>
    </article>
  );
}
