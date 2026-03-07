import { useMemo } from "react";
import { useAudioPlayer } from "@/components/player/AudioPlayerProvider";
import { Button } from "@/components/ui/Button";

const SPEEDS = [0.5, 1, 1.25, 1.5, 2];

export function FullPlayerDrawer() {
  const player = useAudioPlayer();

  const progress = useMemo(() => {
    if (!player.duration) return 0;
    return (player.currentTime / player.duration) * 100;
  }, [player.currentTime, player.duration]);

  if (!player.drawerOpen || !player.prayer) return null;

  return (
    <div className="player-drawer-backdrop" onClick={() => player.setDrawerOpen(false)}>
      <div className="player-drawer" onClick={(event) => event.stopPropagation()}>
        <div className="player-header">
          <div>
            <div className="eyebrow">Now playing</div>
            <h2>{player.prayer.title.en}</h2>
            <p>{player.prayer.meaning || player.prayer.beginnerNote || "Sacred listening and recitation."}</p>
          </div>
          <Button tone="ghost" onClick={() => player.setDrawerOpen(false)}>
            Minimize
          </Button>
        </div>

        <div className="player-progress">
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <input
            type="range"
            min={0}
            max={Math.max(player.duration, 0)}
            value={Math.min(player.currentTime, player.duration || player.currentTime)}
            onChange={(event) => player.seek(Number(event.target.value))}
          />
        </div>

        <div className="player-controls">
          <Button tone="secondary" onClick={() => player.seek(Math.max(player.currentTime - 10, 0))}>
            -10s
          </Button>
          <Button tone="primary" onClick={player.togglePlayback}>
            {player.isPlaying ? "Pause" : "Play"}
          </Button>
          <Button tone="secondary" onClick={() => player.seek(player.currentTime + 10)}>
            +10s
          </Button>
        </div>

        <div className="player-tuning">
          <div>
            <strong>Speed</strong>
            <div className="chip-row">
              {SPEEDS.map((speed) => (
                <button
                  key={speed}
                  type="button"
                  className={`filter-chip ${player.rate === speed ? "active" : ""}`}
                  onClick={() => player.setRate(speed)}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>

          <div>
            <strong>Repetitions</strong>
            <div className="chip-row">
              {[1, 3, 7, 11, 21, 51, 108].map((count) => (
                <button
                  key={count}
                  type="button"
                  className={`filter-chip ${player.repetitionsTarget === count ? "active" : ""}`}
                  onClick={() => player.setRepetitionsTarget(count)}
                >
                  {count}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
