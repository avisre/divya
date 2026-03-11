"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { sendJson } from "../../lib/client-api";
import { Button } from "../ui/Button";
import { StatusStrip } from "../ui/StatusStrip";

type SupportValues = {
  name: string;
  email: string;
  category: string;
  subject: string;
  message: string;
  bookingReference: string;
};

export function SupportForm({
  defaults,
  mode = "protected"
}: {
  defaults?: Partial<SupportValues>;
  mode?: "protected" | "public";
}) {
  const [status, setStatus] = useState("");
  const [pending, setPending] = useState(false);
  const { register, handleSubmit } = useForm<SupportValues>({
    defaultValues: {
      name: defaults?.name || "",
      email: defaults?.email || "",
      category: defaults?.category || "general",
      subject: defaults?.subject || "",
      message: defaults?.message || "",
      bookingReference: defaults?.bookingReference || ""
    }
  });

  return (
    <form
      className="form-grid"
      onSubmit={handleSubmit(async (values) => {
        setPending(true);
        setStatus("");
        try {
          await sendJson("/api/backend/users/contact", {
            method: "POST",
            body: JSON.stringify({
              ...values,
              context: {
                platform: "web",
                screen: mode === "protected" ? "contact" : "contact-us"
              }
            })
          });
          setStatus("Support request submitted. We will follow up by email.");
        } catch (error) {
          setStatus(error instanceof Error ? error.message : "Unable to send your request.");
        } finally {
          setPending(false);
        }
      })}
    >
      <label className="field">
        <span>Name</span>
        <input {...register("name")} />
      </label>
      <label className="field">
        <span>Email</span>
        <input type="email" {...register("email")} />
      </label>
      <label className="field">
        <span>Category</span>
        <select {...register("category")}>
          <option value="booking_help">Booking help</option>
          <option value="gothram_help">Gothram help</option>
          <option value="technical_issue">Technical issue</option>
          <option value="video_help">Video help</option>
          <option value="general">General</option>
        </select>
      </label>
      <label className="field">
        <span>Subject</span>
        <input {...register("subject")} />
      </label>
      <label className="field field--full">
        <span>Message</span>
        <textarea rows={6} {...register("message")} />
      </label>
      <label className="field">
        <span>Booking reference</span>
        <input {...register("bookingReference")} />
      </label>
      {status ? <StatusStrip tone="success">{status}</StatusStrip> : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Submitting..." : "Submit request"}
      </Button>
    </form>
  );
}
