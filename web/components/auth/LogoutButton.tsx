"use client";

import { useRouter } from "next/navigation";
import { sendJson } from "../../lib/client-api";

export function LogoutButton({ dataTestId }: { dataTestId?: string }) {
  const router = useRouter();

  return (
    <button
      data-testid={dataTestId}
      className="button button--ghost"
      type="button"
      onClick={async () => {
        await sendJson<{ success: boolean }>("/api/web-auth/logout", { method: "POST" });
        router.replace("/login");
        router.refresh();
      }}
    >
      Sign out
    </button>
  );
}
