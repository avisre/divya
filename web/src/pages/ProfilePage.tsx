import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { userApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/Button";
import { HeroSection, SectionCard, StatusStrip } from "@/components/ui/Surface";

export default function ProfilePage() {
  const { user, updateLocalUser } = useAuth();
  const [message, setMessage] = useState("");
  const [reminders, setReminders] = useState({ morningTime: "07:00", eveningTime: "19:00" });
  const profile = useQuery({ queryKey: ["profile"], queryFn: () => userApi.profile() });
  const stats = useQuery({ queryKey: ["stats"], queryFn: () => userApi.stats() });
  const updateProfileMutation = useMutation({
    mutationFn: (payload: Parameters<typeof userApi.updateProfile>[0]) => userApi.updateProfile(payload),
    onSuccess: (nextUser) => {
      updateLocalUser(nextUser);
      setMessage("Profile settings saved.");
      profile.refetch();
    }
  });

  const profileData = profile.data || user;

  useEffect(() => {
    setReminders({
      morningTime: profileData?.prayerReminders?.morningTime || "07:00",
      eveningTime: profileData?.prayerReminders?.eveningTime || "19:00"
    });
  }, [profileData?.prayerReminders?.eveningTime, profileData?.prayerReminders?.morningTime]);

  return (
    <div className="page-stack">
      <HeroSection
        eyebrow="Profile"
        title={profileData?.name || "Devotee"}
        subtitle={`${profileData?.subscription?.tier || "free"} tier | ${profileData?.timezone || "timezone not set"}`}
      />

      <SectionCard title="Account">
        <div className="bullet-grid">
          <div>
            <strong>Email</strong>
            <p>{profileData?.email}</p>
          </div>
          <div>
            <strong>Country</strong>
            <p>{profileData?.country || "Not set"}</p>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Reminder settings" subtitle="Adjust daily reminder windows in your local timezone.">
        <div className="stack-form">
          <label>
            Morning prayer time
            <input
              value={reminders.morningTime}
              onChange={(event) => setReminders((current) => ({ ...current, morningTime: event.target.value }))}
            />
          </label>
          <label>
            Evening prayer time
            <input
              value={reminders.eveningTime}
              onChange={(event) => setReminders((current) => ({ ...current, eveningTime: event.target.value }))}
            />
          </label>
          <Button
            onClick={() =>
              updateProfileMutation.mutate({
                prayerReminders: {
                  ...profileData?.prayerReminders,
                  morningTime: reminders.morningTime,
                  eveningTime: reminders.eveningTime
                }
              })
            }
            disabled={updateProfileMutation.isPending}
          >
            {updateProfileMutation.isPending ? "Saving..." : "Save reminder settings"}
          </Button>
          {message ? <StatusStrip tone="success">{message}</StatusStrip> : null}
        </div>
      </SectionCard>

      <SectionCard title="Your rhythm">
        <div className="metric-grid">
          <div className="metric-card">
            <strong>{profileData?.streak?.current || 0}</strong>
            <span>Current streak</span>
          </div>
          <div className="metric-card">
            <strong>{stats.data?.prayersCompleted || 0}</strong>
            <span>Prayers completed</span>
          </div>
          <div className="metric-card">
            <strong>{stats.data?.minutesPrayed || 0}</strong>
            <span>Minutes prayed</span>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Support and community">
        <div className="inline-actions">
          <Link to="/contact" className="btn btn-primary">
            Contact support
          </Link>
          <Link to="/shared-prayer/create" className="btn btn-secondary">
            Create shared prayer
          </Link>
        </div>
      </SectionCard>

      <SectionCard title="Heritage">
        <div className="bullet-grid">
          <div>
            <strong>Tradition</strong>
            <p>{profileData?.onboarding?.tradition || "Not chosen yet"}</p>
          </div>
          <div>
            <strong>Preferred language</strong>
            <p>{profileData?.preferredLanguage || "english"}</p>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
