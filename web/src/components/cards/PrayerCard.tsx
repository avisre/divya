import { Link } from "react-router-dom";
import type { Prayer } from "@/lib/types";

export function PrayerCard({ prayer }: { prayer: Prayer }) {
  const routeId = prayer.slug || prayer.externalId || prayer._id;

  return (
    <article className="content-card">
      <div className="eyebrow">
        {prayer.type} | {prayer.difficulty}
      </div>
      <h3>{prayer.title.en}</h3>
      <p>{prayer.beginnerNote || prayer.meaning || prayer.content.english?.slice(0, 140) || "Sacred prayer."}</p>
      <div className="chip-row">
        <span className="static-chip">{prayer.durationMinutes} min</span>
        <span className="static-chip">{prayer.requiredTier || "free"}</span>
        <span className="static-chip">{prayer.audioUrl ? "Audio ready" : "Text only"}</span>
      </div>
      <Link className="text-link" to={`/prayers/${routeId}`}>
        Open prayer
      </Link>
    </article>
  );
}
