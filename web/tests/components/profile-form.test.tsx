import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ProfileForm } from "../../components/forms/ProfileForm";

const sendJsonMock = vi.fn();
const syncProfileStateMock = vi.fn();

vi.mock("../../lib/client-api", () => ({
  sendJson: (...args: unknown[]) => sendJsonMock(...args)
}));

vi.mock("../../components/ux/GuidedFlowProvider", () => ({
  useGuidedFlow: () => ({
    syncProfileState: syncProfileStateMock
  })
}));

describe("ProfileForm", () => {
  it("saves family name alongside the rest of the profile settings", async () => {
    sendJsonMock.mockResolvedValueOnce({ success: true });

    render(
      <ProfileForm
        user={{
          id: "user-1",
          name: "Anita Nair",
          email: "anita@example.com",
          role: "user",
          familyName: "",
          preferredLanguage: "english",
          country: "US",
          timezone: "America/New_York",
          prayerReminders: {
            morningEnabled: true,
            morningTime: "07:00",
            eveningEnabled: true,
            eveningTime: "19:00",
            festivalAlerts: true,
            reengagementEmails: true
          }
        }}
      />
    );

    fireEvent.change(screen.getByLabelText("Family name"), {
      target: { value: "Nair Family" }
    });

    fireEvent.click(screen.getByRole("button", { name: "Save settings" }));

    await waitFor(() => {
      expect(sendJsonMock).toHaveBeenCalledWith(
        "/api/backend/users/profile",
        expect.objectContaining({
          method: "PUT",
          body: expect.stringContaining("\"familyName\":\"Nair Family\"")
        })
      );
    });

    expect(syncProfileStateMock).toHaveBeenCalledWith({
      familyName: "Nair Family",
      familyNameSkipped: false
    });
    expect(screen.getByText("Profile settings saved.")).toBeInTheDocument();
  });
});
