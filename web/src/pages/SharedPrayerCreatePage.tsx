import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { publicApi, sharedPrayerApi } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { HeroSection, SectionCard, StatusStrip } from "@/components/ui/Surface";

export default function SharedPrayerCreatePage() {
  const navigate = useNavigate();
  const prayers = useQuery({ queryKey: ["shared-prayer-library"], queryFn: () => publicApi.prayers("?limit=108") });
  const [selectedPrayer, setSelectedPrayer] = useState("");
  const [repetitions, setRepetitions] = useState(21);
  const [error, setError] = useState("");
  const createMutation = useMutation({
    mutationFn: () => sharedPrayerApi.create({ prayerId: selectedPrayer, totalRepetitions: repetitions }),
    onSuccess: (session) => navigate(`/shared-prayer/${session.sessionCode}`)
  });

  return (
    <div className="page-stack narrow-stack">
      <HeroSection eyebrow="Pray together" title="Create a shared prayer session" subtitle="Invite family anywhere in the world through one session code and a live shared room." />
      <SectionCard title="Session setup">
        <div className="stack-form">
          <label>
            Prayer
            <select value={selectedPrayer} onChange={(event) => setSelectedPrayer(event.target.value)}>
              <option value="">Select prayer</option>
              {prayers.data?.map((prayer) => (
                <option key={prayer._id} value={prayer._id}>
                  {prayer.title.en}
                </option>
              ))}
            </select>
          </label>
          <label>
            Repetitions
            <select value={repetitions} onChange={(event) => setRepetitions(Number(event.target.value))}>
              {[1, 3, 7, 11, 21, 51, 108].map((count) => (
                <option key={count} value={count}>
                  {count}
                </option>
              ))}
            </select>
          </label>
          {error ? <StatusStrip tone="warning">{error}</StatusStrip> : null}
          <Button
            onClick={() => {
              if (!selectedPrayer) {
                setError("Choose a prayer first.");
                return;
              }
              createMutation.mutate();
            }}
          >
            Create session
          </Button>
        </div>
      </SectionCard>
    </div>
  );
}
