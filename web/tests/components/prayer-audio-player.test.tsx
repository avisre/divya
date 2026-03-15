import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { PrayerAudioPlayer } from "../../components/forms/PrayerAudioPlayer";

describe("PrayerAudioPlayer", () => {
  beforeAll(() => {
    Object.defineProperty(HTMLMediaElement.prototype, "pause", {
      configurable: true,
      value: vi.fn()
    });
    Object.defineProperty(HTMLMediaElement.prototype, "load", {
      configurable: true,
      value: vi.fn()
    });
  });

  it("renders the seek bar and volume controller", () => {
    render(
      <PrayerAudioPlayer src="https://cdn.divya.app/audio/gayatri.mp3" title="Gayatri Mantra" />
    );

    expect(screen.getByLabelText(/Seek prayer audio/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Prayer audio volume/i)).toBeInTheDocument();
  });

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
