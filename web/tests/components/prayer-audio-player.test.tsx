import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { PrayerAudioPlayer } from "../../components/forms/PrayerAudioPlayer";

describe("PrayerAudioPlayer", () => {
  beforeAll(() => {
    Object.defineProperty(HTMLMediaElement.prototype, "readyState", {
      configurable: true,
      get() {
        return 4;
      }
    });
    Object.defineProperty(HTMLMediaElement.prototype, "play", {
      configurable: true,
      value: vi.fn().mockImplementation(function (this: HTMLMediaElement) {
        this.dispatchEvent(new Event("play"));
        return Promise.resolve();
      })
    });
    Object.defineProperty(HTMLMediaElement.prototype, "pause", {
      configurable: true,
      value: vi.fn().mockImplementation(function (this: HTMLMediaElement) {
        this.dispatchEvent(new Event("pause"));
      })
    });
    Object.defineProperty(HTMLMediaElement.prototype, "load", {
      configurable: true,
      value: vi.fn().mockImplementation(function (this: HTMLMediaElement) {
        this.dispatchEvent(new Event("loadstart"));
        this.dispatchEvent(new Event("loadedmetadata"));
        this.dispatchEvent(new Event("loadeddata"));
        this.dispatchEvent(new Event("canplay"));
      })
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

  it("toggles mute without losing the previous audible volume", () => {
    const { container } = render(
      <PrayerAudioPlayer src="https://cdn.divya.app/audio/gayatri.mp3" title="Gayatri Mantra" />
    );

    const volumeRange = screen.getByLabelText(/Prayer audio volume/i);
    const audio = container.querySelector("audio") as HTMLAudioElement;

    fireEvent.change(volumeRange, { target: { value: "42" } });
    fireEvent.click(screen.getByLabelText(/Mute prayer audio/i));

    expect(audio.volume).toBe(0);
    expect(screen.getByText("0%")).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText(/Unmute prayer audio/i));

    expect(audio.volume).toBeCloseTo(0.42, 2);
    expect(screen.getByText("42%")).toBeInTheDocument();
  });

  it("notifies the prayer page when playback starts", async () => {
    const onPlaybackChange = vi.fn();

    render(
      <PrayerAudioPlayer
        src="https://cdn.divya.app/audio/gayatri.mp3"
        title="Gayatri Mantra"
        onPlaybackChange={onPlaybackChange}
      />
    );

    fireEvent.click(screen.getByLabelText(/Play audio/i));

    await waitFor(() => {
      expect(onPlaybackChange).toHaveBeenCalledWith(true);
    });
  });

  it("lets the user reveal native controls as a fallback", () => {
    const { container } = render(
      <PrayerAudioPlayer src="https://cdn.divya.app/audio/gayatri.mp3" title="Gayatri Mantra" />
    );

    fireEvent.click(screen.getByRole("button", { name: /Use native controls/i }));

    expect(container.querySelector("audio")).toHaveAttribute("controls");
  });
});
