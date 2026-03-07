import { useNavigate } from "react-router-dom";
import { useAudioPlayer } from "@/components/player/AudioPlayerProvider";
import { Button } from "@/components/ui/Button";

export function StickyPlayerBar() {
  const navigate = useNavigate();
  const player = useAudioPlayer();
  if (!player.prayer || !player.metadata) return null;

  function openPrayerRoute() {
    navigate(`/prayers/${player.prayer?.slug}`);
  }

  return (
    <aside className="mini-player">
      <div
        className="mini-player-copy"
        onClick={openPrayerRoute}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openPrayerRoute();
          }
        }}
        role="button"
        tabIndex={0}
      >
        <strong>{player.prayer.title.en}</strong>
        <span>
          {player.repetitionsCompleted}/{player.repetitionsTarget} repetitions | {Math.round(player.currentTime)}s
        </span>
      </div>
      <div className="mini-player-actions">
        <Button tone="ghost" onClick={player.togglePlayback}>
          {player.isPlaying ? "Pause" : "Play"}
        </Button>
        <Button tone="secondary" onClick={() => player.setDrawerOpen(true)}>
          Open player
        </Button>
        <Button tone="ghost" onClick={player.close}>
          Close
        </Button>
      </div>
    </aside>
  );
}
