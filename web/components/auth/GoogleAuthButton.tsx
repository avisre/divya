import { BACKEND_ORIGIN } from "@/lib/env";

export function GoogleAuthButton({ returnTo = "/home" }: { returnTo?: string }) {
  const href = `${BACKEND_ORIGIN}/api/auth/oauth/google/start?returnTo=${encodeURIComponent(returnTo)}`;

  return (
    <a className="button button--secondary button--block" href={href}>
      <span className="button__leading">G</span>
      <span>Continue with Google</span>
    </a>
  );
}
