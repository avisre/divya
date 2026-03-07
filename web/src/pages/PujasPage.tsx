import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { publicApi } from "@/lib/api";
import { HeroSection, SectionCard } from "@/components/ui/Surface";
import { PujaCard } from "@/components/cards/PujaCard";

export default function PujasPage() {
  const { user } = useAuth();
  const pujas = useQuery({
    queryKey: ["pujas", user?.currency || "USD"],
    queryFn: () => publicApi.pujas(user?.currency || "USD")
  });

  return (
    <div className="page-stack">
      <HeroSection eyebrow="Pujas" title="Join sacred waitlists for temple rituals" subtitle="Every puja is coordinated directly with the temple team in Karunagapally." />
      <SectionCard title="Puja catalog" subtitle="All pujas remain waitlist-only in this release track.">
        <div className="content-grid">
          {pujas.data?.map((puja) => <PujaCard key={puja._id} puja={puja} />)}
        </div>
      </SectionCard>
    </div>
  );
}
