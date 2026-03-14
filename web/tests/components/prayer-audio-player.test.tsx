import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PrayerAudioPlayer } from "../../components/forms/PrayerAudioPlayer";

describe("PrayerAudioPlayer", () => {
  it("renders a volume control and updates the audio element volume", () => {
    const { container } = render(
      <PrayerAudioPlayer src="https://cdn.divya.app/audio/gayatri.mp3" title="Gayatri Mantra" />
    );

    const volumeRange = screen.getByLabelText(/Prayer audio volume/i);
    const audio = container.querySelector("audio") as HTMLAudioElement;

    fireEvent.change(volumeRange, { target: { value: "35" } });

    expect(audio.volume).toBeCloseTo(0.35, 2);
    expect(screen.getByText("35%")).toBeInTheDocument();
  });
});
