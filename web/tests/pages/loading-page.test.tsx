import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Loading from "../../app/loading";

describe("Loading", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("does not render the loading overlay until the delay elapses", () => {
    render(<Loading />);

    expect(screen.queryByLabelText("Loading Prarthana")).not.toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.getByLabelText("Loading Prarthana")).toBeInTheDocument();
    expect(screen.getByText("Preparing your next page.")).toBeInTheDocument();
  });
});
