import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { publicApi } from "@/lib/api";
import { HeroSection, SectionCard, StatusStrip } from "@/components/ui/Surface";
import { PrayerCard } from "@/components/cards/PrayerCard";

export default function PrayersPage() {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [audioOnly, setAudioOnly] = useState(false);
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const prayers = useQuery({
    queryKey: ["prayers", search, type],
    queryFn: () =>
      publicApi.prayers(
        `?limit=108${search ? `&q=${encodeURIComponent(search)}` : ""}${type ? `&type=${encodeURIComponent(type)}` : ""}`
      )
  });

  const types = useMemo(() => {
    const all = new Set(prayers.data?.map((item) => item.type) || []);
    return [...all];
  }, [prayers.data]);

  const filteredPrayers = useMemo(() => {
    return (prayers.data || []).filter((item) => {
      if (audioOnly && !item.audioUrl) return false;
      if (featuredOnly && !item.isFeatured) return false;
      return true;
    });
  }, [audioOnly, featuredOnly, prayers.data]);

  const audioReadyCount = useMemo(
    () => (prayers.data || []).filter((item) => Boolean(item.audioUrl)).length,
    [prayers.data]
  );

  return (
    <div className="page-stack">
      <HeroSection
        eyebrow="Prayer library"
        title="Read, listen, repeat, and return daily."
        subtitle="A searchable devotional catalog with audio, script, transliteration, and meaning."
      />
      <SectionCard
        title="Browse prayers"
        subtitle={`${prayers.data?.length || 0} prayers available | ${audioReadyCount} ready for audio playback`}
      >
        <div className="toolbar">
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search prayers or mantras" />
          <select value={type} onChange={(event) => setType(event.target.value)}>
            <option value="">All types</option>
            {types.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <div className="chip-row">
          <button
            type="button"
            className={`filter-chip ${audioOnly ? "active" : ""}`}
            onClick={() => setAudioOnly((value) => !value)}
          >
            Audio ready only
          </button>
          <button
            type="button"
            className={`filter-chip ${featuredOnly ? "active" : ""}`}
            onClick={() => setFeaturedOnly((value) => !value)}
          >
            Featured only
          </button>
        </div>
        {!filteredPrayers.length ? (
          <StatusStrip tone="warning">No prayers match the current filters.</StatusStrip>
        ) : null}
        <div className="content-grid">
          {filteredPrayers.map((prayer) => <PrayerCard key={prayer._id} prayer={prayer} />)}
        </div>
      </SectionCard>
    </div>
  );
}
