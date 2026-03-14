import { Button } from "../ui/Button";
import {
  getDeitySymbol,
  getPrayerDifficultyMeta,
  getPrayerTypeMeta,
  getDeityThemeStyle,
  getPrayerPreview
} from "../../lib/presentation";
import type { Prayer } from "../../lib/types";

export function PrayerCard({ prayer }: { prayer: Prayer }) {
  const deityName = prayer.deity?.name?.en || prayer.title.en;
  const themeStyle = getDeityThemeStyle(deityName);
  const deitySymbol = getDeitySymbol(deityName);
  const prayerType = getPrayerTypeMeta(prayer.type);
  const difficulty = getPrayerDifficultyMeta(prayer.difficulty);
  const starterLine =
    difficulty.label === "BEGINNER"
      ? "Good starting prayer - no Sanskrit knowledge needed"
      : difficulty.label === "ADVANCED"
        ? "Best after some practice with shorter prayers"
        : "A fuller prayer that becomes easier with steady repetition";

  return (
    <article className="surface-card prayer-card" style={themeStyle}>
      <div className="prayer-card__tint" />
      <div className="surface-card__meta prayer-card__meta">
        <span className="pill pill--soft">{prayerType.label}</span>
        <span className="muted prayer-card__duration">
          <span aria-hidden="true">o</span>
          {prayer.durationMinutes} min
        </span>
      </div>
      <p className="muted-label">{prayerType.descriptor}</p>
      <h3>{prayer.title.en}</h3>
      <p>{getPrayerPreview(prayer)}</p>
      <p className="prayer-card__starter-line">{"\u2713"} {starterLine}</p>
      <div className="prayer-card__identity">
        <div className="prayer-card__symbol" aria-hidden="true">
          {deitySymbol}
        </div>
        <div>
          <div className="muted-label">Dedicated to</div>
          <strong className="prayer-card__deity">{deityName}</strong>
        </div>
      </div>
      <div className="card-list prayer-card__details">
        <span>{prayer.requiredTier || "free"} tier</span>
        <span className="prayer-card__audio">
          {prayer.audioUrl ? (
            <>
              <span className="waveform-icon" aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
              Audio available
            </>
          ) : (
            "Text guidance"
          )}
        </span>
      </div>
      <div className="card-actions">
        <Button tone="secondary" href={`/prayers/${prayer.slug}`}>
          Open prayer
        </Button>
      </div>
      <a
        className="inline-link prayer-card__family-link"
        href={`/sessions/create?prayer=${encodeURIComponent(prayer._id)}`}
      >
        Pray with family {"->"}
      </a>
    </article>
  );
}
