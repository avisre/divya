import { useQuery } from "@tanstack/react-query";
import { authApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";

type OAuthButtonsProps = {
  returnTo: string;
};

const providerLabel: Record<string, string> = {
  google: "Continue with Google",
  github: "Continue with GitHub"
};

export function OAuthButtons({ returnTo }: OAuthButtonsProps) {
  const { startOAuth } = useAuth();
  const providers = useQuery({
    queryKey: ["oauth-providers"],
    queryFn: () => authApi.oauthProviders(),
    staleTime: 10 * 60_000
  });

  const enabledProviders = (providers.data?.providers || []).filter((item) => item.enabled);
  if (enabledProviders.length === 0) {
    return null;
  }

  return (
    <div className="oauth-grid" aria-label="OAuth sign in options">
      {enabledProviders.map((provider) => (
        <button
          key={provider.id}
          type="button"
          className="btn btn-ghost oauth-btn"
          onClick={() => startOAuth(provider.id as "google" | "github", returnTo)}
        >
          {providerLabel[provider.id] || `Continue with ${provider.id}`}
        </button>
      ))}
    </div>
  );
}

