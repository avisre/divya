"use client";

import { useState } from "react";
import { Button } from "../ui/Button";
import { useGuidedFlow } from "./GuidedFlowProvider";

export function WelcomeDismissButton() {
  const { startGuidedFlow } = useGuidedFlow();
  const [pending, setPending] = useState(false);

  return (
    <Button
      data-testid="welcome-dismiss"
      type="button"
      onClick={async () => {
        setPending(true);
        await startGuidedFlow();
      }}
      disabled={pending}
    >
      {pending ? "Starting your introduction..." : "Continue your introduction ->"}
    </Button>
  );
}
