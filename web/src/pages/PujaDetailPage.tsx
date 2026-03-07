import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { publicApi } from "@/lib/api";
import { BookingWizard } from "@/components/forms/BookingWizard";
import { HeroSection, SectionCard, StatusStrip } from "@/components/ui/Surface";

export default function PujaDetailPage() {
  const { id = "" } = useParams();
  const [mode, setMode] = useState<"self" | "gift">("self");
  const puja = useQuery({ queryKey: ["puja", id], queryFn: () => publicApi.puja(id), enabled: Boolean(id) });

  if (!puja.data) {
    return <div className="page-state">Loading puja...</div>;
  }

  return (
    <div className="page-stack">
      <HeroSection
        eyebrow="Sacred offering"
        title={puja.data.name.en}
        subtitle={puja.data.description?.short || puja.data.description?.full || "Temple ritual coordinated from Karunagapally."}
      >
        <div className="metric-grid compact-grid">
          <div className="metric-card">
            <strong>
              {puja.data.displayPrice?.currency} {puja.data.displayPrice?.amount}
            </strong>
            <span>Displayed price</span>
          </div>
          <div className="metric-card">
            <strong>{puja.data.duration || 0} min</strong>
            <span>Approx. duration</span>
          </div>
        </div>
      </HeroSection>

      <SectionCard title="Why families book this" subtitle={puja.data.description?.nriNote}>
        <div className="bullet-grid">
          <div>
            <strong>Benefits</strong>
            <ul>{puja.data.benefits?.map((item) => <li key={item}>{item}</li>)}</ul>
          </div>
          <div>
            <strong>Best for</strong>
            <ul>{puja.data.bestFor?.map((item) => <li key={item}>{item}</li>)}</ul>
          </div>
        </div>
        <StatusStrip tone="warning">{puja.data.prasadNote || "Prasad delivery is not available in this flow."}</StatusStrip>
      </SectionCard>

      <SectionCard title="Ritual details">
        <p>{puja.data.description?.whatHappens || puja.data.description?.full}</p>
        <ul>{puja.data.requirements?.map((item) => <li key={item}>{item}</li>)}</ul>
      </SectionCard>

      <SectionCard title="Choose the booking flow">
        <div className="chip-row">
          <button type="button" className={`filter-chip ${mode === "self" ? "active" : ""}`} onClick={() => setMode("self")}>
            Join for myself
          </button>
          <button type="button" className={`filter-chip ${mode === "gift" ? "active" : ""}`} onClick={() => setMode("gift")}>
            Gift this puja
          </button>
        </div>
      </SectionCard>

      <BookingWizard puja={puja.data} gifting={mode === "gift"} />
    </div>
  );
}
