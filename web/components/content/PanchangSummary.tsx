import { getPanchangTone } from "../../lib/presentation";
import type { Panchang } from "../../lib/types";

export function PanchangSummary({ panchang }: { panchang: Panchang }) {
  const tone = getPanchangTone(panchang);
  const whatThisMeans =
    tone === "auspicious"
      ? "A favourable day for new beginnings, prayer, and temple offerings."
      : tone === "inauspicious"
        ? "Amavasya - a day for ancestor prayers and quiet reflection. Avoid new undertakings."
        : "A steady day. Maintain your practice.";

  return (
    <article className={`surface-card panchang-card panchang-card--${tone}`}>
      <div className="surface-card__meta">
        <span className="pill pill--soft">{"Today\u2019s panchang"}</span>
        <span className="muted">{panchang.timezone}</span>
      </div>
      <h3>
        {panchang.tithi.name}
        {panchang.tithi.paksha ? ` - ${panchang.tithi.paksha}` : ""}
      </h3>
      <p>{panchang.dailyGuidance?.overall || "Daily timing guidance is available for your timezone."}</p>
      <p className="panchang-card__meaning">{whatThisMeans}</p>
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
