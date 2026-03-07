import type { Panchang } from "@/lib/types";
import { SectionCard, StatusStrip } from "@/components/ui/Surface";

export function PanchangPanel({ panchang }: { panchang: Panchang }) {
  const goodFor = panchang.dailyGuidance?.goodFor || [];
  const avoidFor = panchang.dailyGuidance?.avoidFor || [];

  return (
    <SectionCard title="Today's Panchang" subtitle={`Referenced from Karunagapally and converted to ${panchang.timezone}.`}>
      <div className="metric-grid">
        <div className="metric-card">
          <strong>{panchang.tithi.name}</strong>
          <span>Tithi</span>
        </div>
        <div className="metric-card">
          <strong>{panchang.nakshatra.name}</strong>
          <span>Nakshatra</span>
        </div>
        <div className="metric-card">
          <strong>{panchang.rahuKaal?.start || "-"}</strong>
          <span>Rahu Kaal starts</span>
        </div>
        <div className="metric-card">
          <strong>{panchang.rahuKaal?.end || "-"}</strong>
          <span>Rahu Kaal ends</span>
        </div>
      </div>
      <StatusStrip tone="warning">
        {panchang.infoTooltip ||
          "Panchang timings are based on Karunagapally, Kerala and converted to your local timezone."}
      </StatusStrip>
      {goodFor.length ? (
        <div className="bullet-grid">
          <div>
            <strong>Good for</strong>
            <ul>{goodFor.map((item) => <li key={item}>{item}</li>)}</ul>
          </div>
          <div>
            <strong>Avoid for</strong>
            <ul>{avoidFor.map((item) => <li key={item}>{item}</li>)}</ul>
          </div>
        </div>
      ) : null}
    </SectionCard>
  );
}
