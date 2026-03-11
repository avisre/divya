import { Button } from "../ui/Button";
import type { Prayer } from "../../lib/types";

export function PrayerCard({ prayer }: { prayer: Prayer }) {
  return (
    <article className="surface-card">
      <div className="surface-card__meta">
        <span className="pill">{prayer.type}</span>
        <span className="muted">{prayer.durationMinutes} min</span>
      </div>
      <h3>{prayer.title.en}</h3>
      <p>{prayer.beginnerNote || prayer.meaning || prayer.content.english || "Sacred text and guided reading."}</p>
      {prayer.deity?.name?.en ? <div className="muted-label">Dedicated to {prayer.deity.name.en}</div> : null}
      <div className="card-list">
        <span>{prayer.requiredTier || "free"} tier</span>
        <span>{prayer.audioUrl ? "Audio available" : "Text guidance"}</span>
      </div>
      <div className="card-actions">
        <Button href={`/prayers/${prayer.slug}`}>Open prayer</Button>
      </div>
    </article>
  );
}
