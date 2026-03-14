"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { sendJson } from "../../lib/client-api";
import { Button } from "../ui/Button";
import { StatusStrip } from "../ui/StatusStrip";

type ForgotPasswordValues = {
  email: string;
};

export function ForgotPasswordForm() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { register, handleSubmit, watch } = useForm<ForgotPasswordValues>({
    defaultValues: { email: "" }
  });

  const isValid = Boolean(watch("email"));

  return (
    <form
      className="form-stack"
      onSubmit={handleSubmit(async (values) => {
        setPending(true);
        setError("");
        setSuccess("");
        try {
          const result = await sendJson<{ message: string }>("/api/web-auth/forgot-password", {
            method: "POST",
            body: JSON.stringify(values)
          });
          setSuccess(result.message);
        } catch (submitError) {
          setError(submitError instanceof Error ? submitError.message : "Unable to send reset link.");
        } finally {
          setPending(false);
        }
      })}
    >
      <label className="field">
        <span>Email</span>
        <input type="email" placeholder="you@example.com" {...register("email")} />
      </label>
      {success ? <StatusStrip tone="success">{success}</StatusStrip> : null}
      {error ? <StatusStrip tone="warning">{error}</StatusStrip> : null}
      <Button type="submit" block disabled={pending || !isValid} className={!isValid ? "button--soft-disabled" : ""}>
        {pending ? "Sending link..." : "Send reset link"}
      </Button>
    </form>
  );
}

