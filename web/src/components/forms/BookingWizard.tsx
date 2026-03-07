import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { bookingApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/Button";
import { FilterChip, InfoNote, SectionCard, StatusStrip } from "@/components/ui/Surface";
import type { Puja } from "@/lib/types";

const bookingSchema = z.object({
  devoteeName: z.string().min(2),
  gothram: z.string().optional(),
  nakshatra: z.string().optional(),
  prayerIntention: z.string().min(10).max(500),
  surnameCommunity: z.string().optional(),
  familyRegion: z.string().optional(),
  knownFamilyGothram: z.string().optional()
});

type BookingWizardProps = {
  puja: Puja;
  gifting?: boolean;
};

export function BookingWizard({ puja, gifting = false }: BookingWizardProps) {
  const { continueAsGuest, isAuthenticated } = useAuth();
  const [status, setStatus] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [suggestedGothram, setSuggestedGothram] = useState<null | {
    gothram: string;
    confidence: string;
    guidanceText: string;
  }>(null);
  const form = useForm<z.infer<typeof bookingSchema>>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      devoteeName: "",
      gothram: "",
      nakshatra: "",
      prayerIntention: "",
      surnameCommunity: "",
      familyRegion: "",
      knownFamilyGothram: ""
    }
  });

  const repetitionSuggestion = useMemo(() => puja.bestFor?.slice(0, 3) || [], [puja.bestFor]);

  async function ensureSession() {
    if (!isAuthenticated) {
      await continueAsGuest();
    }
  }

  async function onSuggestGothram() {
    const devoteeName = form.getValues("devoteeName");
    if (!devoteeName) {
      setStatus("Enter the devotee name first.");
      return;
    }
    await ensureSession();
    const result = await bookingApi.gothramSuggest({
      devoteeName,
      surnameCommunity: form.getValues("surnameCommunity"),
      familyRegion: form.getValues("familyRegion"),
      knownFamilyGothram: form.getValues("knownFamilyGothram")
    });
    form.setValue("gothram", result.gothram);
    setSuggestedGothram(result);
    setStatus(`Suggested gothram: ${result.gothram}`);
  }

  const onSubmit = form.handleSubmit(async (values) => {
    setSubmitting(true);
    setStatus("");
    try {
      await ensureSession();
      if (gifting) {
        await bookingApi.createGift({
          pujaId: puja._id,
          devoteeName: values.devoteeName,
          gothram: values.gothram,
          nakshatra: values.nakshatra,
          prayerIntention: values.prayerIntention,
          giftDetails: {
            isGift: true,
            recipientName: values.devoteeName,
            personalMessage: `A sacred offering through ${puja.name.en}.`
          }
        });
      } else {
        await bookingApi.create(
          {
            pujaId: puja._id,
            devoteeName: values.devoteeName,
            gothram: values.gothram,
            nakshatra: values.nakshatra,
            prayerIntention: values.prayerIntention
          },
          `${puja._id}-${values.devoteeName}-${Date.now()}`
        );
      }
      setStatus(gifting ? "Gift puja request submitted." : "Puja request submitted successfully.");
      form.reset();
      setSuggestedGothram(null);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to submit the puja request.");
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <SectionCard
      title={gifting ? "Gift this puja" : "Join the sacred waitlist"}
      subtitle="The temple team will review the request, keep your position, and coordinate the ritual from Karunagapally."
    >
      <form className="stack-form" onSubmit={onSubmit}>
        <label>
          Devotee name
          <input {...form.register("devoteeName")} placeholder="Full name" />
        </label>
        <label>
          Family surname or community
          <input {...form.register("surnameCommunity")} placeholder="Optional" />
        </label>
        <label>
          Family region
          <input {...form.register("familyRegion")} placeholder="Kerala, Tamil Nadu, etc." />
        </label>
        <label>
          Known family gothram
          <input {...form.register("knownFamilyGothram")} placeholder="Optional" />
        </label>
        <div className="form-inline">
          <label>
            Gothram
            <input {...form.register("gothram")} placeholder="Kashyap or Unknown" />
          </label>
          <Button type="button" tone="secondary" onClick={() => void onSuggestGothram()}>
            Find my gothram
          </Button>
        </div>
        {suggestedGothram ? (
          <InfoNote>
            {suggestedGothram.guidanceText} Confidence: {suggestedGothram.confidence}.
          </InfoNote>
        ) : null}
        <label>
          Nakshatra
          <input {...form.register("nakshatra")} placeholder="Optional" />
        </label>
        <label>
          Prayer intention
          <textarea rows={5} {...form.register("prayerIntention")} placeholder="Describe the blessing or intention." />
        </label>
        <div className="chip-row">
          {repetitionSuggestion.map((item) => (
            <FilterChip key={item}>{item}</FilterChip>
          ))}
        </div>
        {status ? <StatusStrip tone="success">{status}</StatusStrip> : null}
        <Button type="submit" disabled={submitting} block>
          {submitting ? "Submitting..." : gifting ? "Submit gift request" : "Submit puja request"}
        </Button>
      </form>
    </SectionCard>
  );
}
