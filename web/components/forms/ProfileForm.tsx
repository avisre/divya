"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { sendJson } from "../../lib/client-api";
import { Button } from "../ui/Button";
import { StatusStrip } from "../ui/StatusStrip";
import type { UserSession } from "../../lib/types";

type ProfileValues = {
  preferredLanguage: string;
  country: string;
  timezone: string;
  morningTime: string;
  eveningTime: string;
  morningEnabled: boolean;
  eveningEnabled: boolean;
  festivalAlerts: boolean;
  reengagementEmails: boolean;
};

export function ProfileForm({ user }: { user: UserSession }) {
  const [status, setStatus] = useState("");
  const [pending, setPending] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState("default");
  const { register, handleSubmit } = useForm<ProfileValues>({
    defaultValues: {
      preferredLanguage: user.preferredLanguage || "english",
      country: user.country || "US",
      timezone: user.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      morningTime: user.prayerReminders?.morningTime || "07:00",
      eveningTime: user.prayerReminders?.eveningTime || "19:00",
      morningEnabled: user.prayerReminders?.morningEnabled ?? true,
      eveningEnabled: user.prayerReminders?.eveningEnabled ?? true,
      festivalAlerts: user.prayerReminders?.festivalAlerts ?? true,
      reengagementEmails: user.prayerReminders?.reengagementEmails ?? true
    }
  });

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotificationPermission(window.Notification.permission);
    }
  }, []);

  return (
    <form
      className="form-grid"
      onSubmit={handleSubmit(async (values) => {
        setPending(true);
        setStatus("");
        try {
          await sendJson("/api/backend/users/profile", {
            method: "PUT",
            body: JSON.stringify({
              preferredLanguage: values.preferredLanguage,
              country: values.country,
              timezone: values.timezone,
              prayerReminders: {
                ...(user.prayerReminders || {}),
                morningEnabled: values.morningEnabled,
                morningTime: values.morningTime,
                eveningEnabled: values.eveningEnabled,
                eveningTime: values.eveningTime,
                festivalAlerts: values.festivalAlerts,
                reengagementEmails: values.reengagementEmails
              }
            })
          });
          setStatus("Profile settings saved.");
        } catch (error) {
          setStatus(error instanceof Error ? error.message : "Unable to save profile.");
        } finally {
          setPending(false);
        }
      })}
    >
      <label className="field">
        <span>Preferred language</span>
        <input {...register("preferredLanguage")} />
      </label>
      <label className="field">
        <span>Country</span>
        <input {...register("country")} />
      </label>
      <label className="field">
        <span>Timezone</span>
        <input {...register("timezone")} />
      </label>
      <label className="field">
        <span>Morning prayer time</span>
        <input {...register("morningTime")} />
      </label>
      <label className="field">
        <span>Evening prayer time</span>
        <input {...register("eveningTime")} />
      </label>
      <label className="catalog-checkbox">
        <input type="checkbox" {...register("morningEnabled")} />
        <span>Morning reminders</span>
      </label>
      <label className="catalog-checkbox">
        <input type="checkbox" {...register("eveningEnabled")} />
        <span>Evening reminders</span>
      </label>
      <label className="catalog-checkbox">
        <input type="checkbox" {...register("festivalAlerts")} />
        <span>Festival alerts</span>
      </label>
      <label className="catalog-checkbox">
        <input type="checkbox" {...register("reengagementEmails")} />
        <span>7-day re-engagement email</span>
      </label>
      <div className="surface-card profile-form__notification field--full">
        <strong>Browser reminders</strong>
        <p>
          Ask for browser notification permission here, not on first load. Email reminders continue even if this device does not support browser push.
        </p>
        <p className="muted">Permission: {notificationPermission}</p>
        <div className="card-actions">
          <Button
            type="button"
            tone="secondary"
            onClick={async () => {
              if (typeof window === "undefined" || !("Notification" in window)) {
                setStatus("Browser notifications are not supported on this device.");
                return;
              }
              const permission = await window.Notification.requestPermission();
              setNotificationPermission(permission);
              setStatus(
                permission === "granted"
                  ? "Browser notifications enabled for this device."
                  : "Browser notifications remain disabled."
              );
            }}
          >
            Enable browser reminders
          </Button>
        </div>
      </div>
      {status ? <StatusStrip tone="success">{status}</StatusStrip> : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : "Save settings"}
      </Button>
    </form>
  );
}
