import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GuidedFlowProvider } from "../../components/ux/GuidedFlowProvider";
import { WelcomeDismissButton } from "../../components/ux/WelcomeDismissButton";

const sendJsonMock = vi.fn();
const trackEventMock = vi.fn();
const routerPushMock = vi.fn();

let pathname = "/welcome";

vi.mock("../../lib/client-api", () => ({
  sendJson: (...args: unknown[]) => sendJsonMock(...args)
}));

vi.mock("../../lib/analytics", () => ({
  trackEvent: (...args: unknown[]) => trackEventMock(...args)
}));

vi.mock("next/navigation", () => ({
  usePathname: () => pathname,
  useRouter: () => ({
    push: routerPushMock
  })
}));

describe("GuidedFlowProvider", () => {
  beforeEach(() => {
    pathname = "/welcome";
    sendJsonMock.mockReset();
    trackEventMock.mockReset();
    routerPushMock.mockReset();
    sendJsonMock.mockResolvedValue({});
  });

  it("starts the guided flow from the welcome handoff", async () => {
    render(
      <GuidedFlowProvider
        user={{
          id: "user-1",
          name: "Anita Nair",
          email: "anita@example.com",
          role: "user",
          welcomeSeenAt: "2026-03-20T00:00:00.000Z"
        }}
      >
        <WelcomeDismissButton />
        <div data-guided-target="panchang-summary">
          <h3 data-guided-panchang-tithi>Ekadashi</h3>
        </div>
      </GuidedFlowProvider>
    );

    fireEvent.click(screen.getByTestId("welcome-dismiss"));

    await waitFor(() => {
      expect(sendJsonMock).toHaveBeenCalledWith(
        "/api/backend/users/profile",
        expect.objectContaining({
          method: "PUT",
          body: expect.stringContaining("\"currentStep\":1")
        })
      );
    });

    expect(screen.getByTestId("guided-overlay")).toBeInTheDocument();
    expect(screen.getByTestId("guided-step-indicator")).toHaveTextContent("Step 1 of 5");
    expect(routerPushMock).toHaveBeenCalledWith("/home");
  });

  it("saves the family name in step 4 and advances to step 5", async () => {
    pathname = "/profile";

    render(
      <GuidedFlowProvider
        user={{
          id: "user-1",
          name: "Anita Nair",
          email: "anita@example.com",
          role: "user",
          welcomeSeenAt: "2026-03-20T00:00:00.000Z",
          guidedFlow: {
            active: true,
            currentStep: 4,
            completedSteps: [1, 2, 3],
            startedAt: "2026-03-20T00:00:00.000Z",
            completedAt: null,
            exitedAt: null,
            exitedOnStep: null
          }
        }}
      >
        <input data-guided-target="profile-family-name" />
      </GuidedFlowProvider>
    );

    fireEvent.change(screen.getByTestId("guided-family-name-input"), {
      target: { value: "Nair Family" }
    });
    fireEvent.click(screen.getByTestId("guided-save-continue"));

    await waitFor(() => {
      expect(sendJsonMock).toHaveBeenCalledWith(
        "/api/backend/users/profile",
        expect.objectContaining({
          method: "PUT",
          body: expect.stringContaining("\"familyName\":\"Nair Family\"")
        })
      );
    });

    expect(routerPushMock).toHaveBeenCalledWith("/home");
  });

  it("completes the guided flow and routes into the prayer library", async () => {
    pathname = "/home";

    render(
      <GuidedFlowProvider
        user={{
          id: "user-1",
          name: "Anita Nair",
          email: "anita@example.com",
          role: "user",
          welcomeSeenAt: "2026-03-20T00:00:00.000Z",
          guidedFlow: {
            active: true,
            currentStep: 5,
            completedSteps: [1, 2, 3, 4],
            startedAt: "2026-03-20T00:00:00.000Z",
            completedAt: null,
            exitedAt: null,
            exitedOnStep: null
          }
        }}
      >
        <div />
      </GuidedFlowProvider>
    );

    fireEvent.click(screen.getByTestId("guided-flow-complete-cta"));

    await waitFor(() => {
      expect(trackEventMock).toHaveBeenCalledWith("Guided Flow Completed", {
        stepsCompleted: 5
      });
    });

    expect(routerPushMock).toHaveBeenCalledWith("/prayers");
  });

  it("exits the guided flow and opens the Learn entry from step 1", async () => {
    pathname = "/home";

    render(
      <GuidedFlowProvider
        user={{
          id: "user-1",
          name: "Anita Nair",
          email: "anita@example.com",
          role: "user",
          welcomeSeenAt: "2026-03-20T00:00:00.000Z",
          guidedFlow: {
            active: true,
            currentStep: 1,
            completedSteps: [],
            startedAt: "2026-03-20T00:00:00.000Z",
            completedAt: null,
            exitedAt: null,
            exitedOnStep: null
          }
        }}
      >
        <div data-guided-target="panchang-summary">
          <h3 data-guided-panchang-tithi>Ekadashi</h3>
        </div>
      </GuidedFlowProvider>
    );

    fireEvent.click(screen.getByTestId("guided-panchang-learn-link"));

    await waitFor(() => {
      expect(sendJsonMock).toHaveBeenCalledWith(
        "/api/backend/users/profile",
        expect.objectContaining({
          method: "PUT",
          body: expect.stringContaining("\"exitedOnStep\":1")
        })
      );
    });

    expect(trackEventMock).toHaveBeenCalledWith("Guided Flow Exited", {
      step: 1
    });
    expect(routerPushMock).toHaveBeenCalledWith("/learn/the-panchang-explained");
  });
});
