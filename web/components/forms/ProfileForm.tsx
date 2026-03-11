"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { sendJson } from "@/lib/client-api";
import { Button } from "@/components/ui/Button";
import { StatusStrip } from "@/components/ui/StatusStrip";
import type { UserSession } from "@/lib/types";

type ProfileValues = {
  preferredLanguage: string;
  country: string;
  timezone: string;
  morningTime: string;
  eveningTime: string;
};

export function ProfileForm({ user }: { user: UserSession }) {
  const [status, setStatus] = useState("");
  const [pending, setPending] = useState(false);
  const { register, handleSubmit } = useForm<ProfileValues>({
    defaultValues: {
      preferredLanguage: user.preferredLanguage || "english",
      country: user.country || "US",
      timezone: user.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      morningTime: user.prayerReminders?.morningTime || "07:00",
      eveningTime: user.prayerReminders?.eveningTime || "19:00"
    }
  });

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
                morningTime: values.morningTime,
                eveningTime: values.eveningTime
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
      {status ? <StatusStrip tone="success">{status}</StatusStrip> : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : "Save settings"}
      </Button>
    </form>
  );
}
