"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { sendJson } from "../../lib/client-api";
import { Button } from "../ui/Button";
import { StatusStrip } from "../ui/StatusStrip";

type ResetPasswordValues = {
  password: string;
  confirmPassword: string;
};

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const { register, handleSubmit, watch } = useForm<ResetPasswordValues>({
    defaultValues: {
      password: "",
      confirmPassword: ""
    }
  });

  const password = watch("password") || "";
  const confirmPassword = watch("confirmPassword") || "";
  const isValid = Boolean(token && password.length >= 8 && password === confirmPassword);

  if (!token) {
    return (
      <StatusStrip tone="warning">
        This reset link is incomplete. Open the password reset email again and use the full link.
      </StatusStrip>
    );
  }

  return (
    <form
      className="form-stack"
      onSubmit={handleSubmit(async (values) => {
        setPending(true);
        setError("");
        try {
          await sendJson<{ message: string }>("/api/web-auth/reset-password", {
            method: "POST",
            body: JSON.stringify({
              token,
              password: values.password
            })
          });
          router.push("/login?reset=success");
          router.refresh();
        } catch (submitError) {
          setError(submitError instanceof Error ? submitError.message : "Unable to reset password.");
        } finally {
          setPending(false);
        }
      })}
    >
      <label className="field">
        <span>New password</span>
        <input type="password" placeholder="At least 8 characters" {...register("password")} />
      </label>
      <label className="field">
        <span>Confirm new password</span>
        <input type="password" placeholder="Retype your password" {...register("confirmPassword")} />
      </label>
      {confirmPassword && password !== confirmPassword ? (
        <StatusStrip tone="warning">Passwords must match before you continue.</StatusStrip>
      ) : null}
      {error ? <StatusStrip tone="warning">{error}</StatusStrip> : null}
      <Button type="submit" block disabled={pending || !isValid} className={!isValid ? "button--soft-disabled" : ""}>
        {pending ? "Updating password..." : "Update password"}
      </Button>
    </form>
  );
}
