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
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<SupportValues>({
    defaultValues: {
      name: defaults?.name || "",
      email: defaults?.email || "",
      category: defaults?.category || "general",
      subject: defaults?.subject || "",
      message: defaults?.message || "",
      bookingReference: defaults?.bookingReference || ""
    }
  });
  const isValid = Boolean(watch("name")?.trim() && watch("email")?.trim() && watch("subject")?.trim() && watch("message")?.trim());

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
          setStatus("Support request submitted. We will respond within 24 hours.");
        } catch (error) {
          setStatus(error instanceof Error ? error.message : "Unable to send your request.");
        } finally {
          setPending(false);
        }
      })}
    >
      <label className="field">
        <span>Name</span>
        <input {...register("name", { required: "Name is required." })} />
        {errors.name ? <small className="field__error">{errors.name.message}</small> : null}
      </label>
      <label className="field">
        <span>Email</span>
        <input
          type="email"
          {...register("email", {
            required: "Email is required.",
            pattern: {
              value: /\S+@\S+\.\S+/,
              message: "Enter a valid email address."
            }
          })}
        />
        {errors.email ? <small className="field__error">{errors.email.message}</small> : null}
      </label>
      <label className="field">
        <span>Category</span>
        <select {...register("category")}>
          <option value="general">General</option>
          <option value="booking_help">Booking question</option>
          <option value="gothram_help">Gothram help</option>
          <option value="technical_issue">Technical</option>
          <option value="video_help">Video delivery</option>
          <option value="other">Other</option>
        </select>
      </label>
      <label className="field">
        <span>Subject</span>
        <input {...register("subject", { required: "Subject is required." })} />
        {errors.subject ? <small className="field__error">{errors.subject.message}</small> : null}
      </label>
      <label className="field field--full">
        <span>Message</span>
        <textarea rows={6} {...register("message", { required: "Message is required." })} />
        {errors.message ? <small className="field__error">{errors.message.message}</small> : null}
      </label>
      <label className="field">
        <span>Booking reference</span>
        <input {...register("bookingReference")} />
      </label>
      {mode === "public" ? <p className="muted">Typical response time: within 24 hours.</p> : null}
      {status ? <StatusStrip tone="success">{status}</StatusStrip> : null}
      <Button type="submit" disabled={pending || !isValid}>
        {pending ? "Submitting..." : "Submit request"}
      </Button>
    </form>
  );
}
