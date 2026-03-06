import { useEffect, useMemo, useState } from "react";
import {
  calculateNakshatra,
  fetchSimulatorBootstrap,
  simulateBooking,
  type SimulatedBooking,
  type SimulatorBootstrap
} from "../lib/simulatorApi";

type Props = {
  baseUrl: string;
};

const cardStyle: React.CSSProperties = {
  background: "#fff",
  borderRadius: 18,
  border: "1px solid #e7d4b2",
  padding: 16
};

export default function BookingSimulator({ baseUrl }: Props) {
  const [currency, setCurrency] = useState("USD");
  const [bootstrap, setBootstrap] = useState<SimulatorBootstrap | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [pujaId, setPujaId] = useState("");
  const [devoteeName, setDevoteeName] = useState("");
  const [gothram, setGothram] = useState("Kashyap");
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("06:30");
  const [timezone, setTimezone] = useState("America/New_York");
  const [nakshatra, setNakshatra] = useState("");
  const [intention, setIntention] = useState("");
  const [rangeStart, setRangeStart] = useState("");
  const [rangeEnd, setRangeEnd] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<SimulatedBooking | null>(null);

  const selectedPuja = useMemo(
    () => bootstrap?.pujas.find((puja) => puja.id === pujaId) || null,
    [bootstrap, pujaId]
  );

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    fetchSimulatorBootstrap(baseUrl, currency)
      .then((payload) => {
        if (!active) return;
        setBootstrap(payload);
        setPujaId((current) => current || payload.pujas[0]?.id || "");
        setGothram(payload.defaults.gothram || "Kashyap");
        setTimezone(payload.defaults.timezone || "America/New_York");
      })
      .catch((err: unknown) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Failed to load simulator");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [baseUrl, currency]);

  const onCalculateNakshatra = async () => {
    if (!birthDate) {
      setError("Birth date is required to calculate nakshatra.");
      return;
    }
    setError(null);
    try {
      const response = await calculateNakshatra(baseUrl, {
        birthDate,
        birthTime,
        timezone
      });
      setNakshatra(response.name);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not calculate nakshatra");
    }
  };

  const onSimulate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!pujaId) {
      setError("Select a puja first.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const payload = await simulateBooking(baseUrl, {
        pujaId,
        devoteeName,
        gothram,
        nakshatra: nakshatra || undefined,
        birthDate: birthDate || undefined,
        birthTime: birthTime || undefined,
        timezone,
        prayerIntention: intention,
        currency,
        requestedDateRange: { start: rangeStart || undefined, end: rangeEnd || undefined }
      });
      setResult(payload);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Simulation failed");
      setResult(null);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div>
        <h1>Online Booking Simulator</h1>
        <p>
          Simulate the full waitlist journey without real payment. This is for testing flow, pricing display,
          nakshatra, and booking communication.
        </p>
      </div>

      <div style={cardStyle}>
        <label>
          Display Currency:&nbsp;
          <select value={currency} onChange={(event) => setCurrency(event.target.value)}>
            <option value="USD">USD</option>
            <option value="GBP">GBP</option>
            <option value="CAD">CAD</option>
            <option value="AUD">AUD</option>
            <option value="AED">AED</option>
          </select>
        </label>
      </div>

      {loading ? <div style={cardStyle}>Loading simulator data...</div> : null}
      {error ? <div style={{ ...cardStyle, borderColor: "#f1ba90", color: "#8a3b00" }}>{error}</div> : null}

      {bootstrap ? (
        <>
          <div style={cardStyle}>
            <h3 style={{ marginTop: 0 }}>Temple</h3>
            <p>
              <strong>{bootstrap.temple.name.en}</strong> ({bootstrap.temple.timezone})
            </p>
            <p>{bootstrap.temple.nriNote}</p>
          </div>

          <form onSubmit={onSimulate} style={{ ...cardStyle, display: "grid", gap: 12 }}>
            <h3 style={{ marginTop: 0 }}>Simulate Booking</h3>
            <label>
              Puja:
              <select value={pujaId} onChange={(event) => setPujaId(event.target.value)} style={{ width: "100%" }}>
                {bootstrap.pujas.map((puja) => (
                  <option key={puja.id} value={puja.id}>
                    {puja.name.en} - {puja.displayPrice.currency} {puja.displayPrice.amount}
                  </option>
                ))}
              </select>
            </label>

            {selectedPuja ? (
              <div style={{ background: "#fff8ef", borderRadius: 12, padding: 12, border: "1px solid #f0dfc5" }}>
                <div><strong>{selectedPuja.name.en}</strong></div>
                <div>{selectedPuja.description?.short}</div>
                <div>Estimated wait: {selectedPuja.estimatedWaitWeeks} weeks</div>
              </div>
            ) : null}

            <label>
              Devotee Name:
              <input value={devoteeName} onChange={(event) => setDevoteeName(event.target.value)} style={{ width: "100%" }} />
            </label>
            <label>
              Gothram:
              <input value={gothram} onChange={(event) => setGothram(event.target.value)} style={{ width: "100%" }} />
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <label>
                Birth Date:
                <input type="date" value={birthDate} onChange={(event) => setBirthDate(event.target.value)} style={{ width: "100%" }} />
              </label>
              <label>
                Birth Time:
                <input type="time" value={birthTime} onChange={(event) => setBirthTime(event.target.value)} style={{ width: "100%" }} />
              </label>
            </div>
            <label>
              Timezone:
              <input value={timezone} onChange={(event) => setTimezone(event.target.value)} style={{ width: "100%" }} />
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12, alignItems: "end" }}>
              <label>
                Nakshatra:
                <input value={nakshatra} onChange={(event) => setNakshatra(event.target.value)} style={{ width: "100%" }} />
              </label>
              <button type="button" onClick={() => void onCalculateNakshatra()}>
                Calculate
              </button>
            </div>
            <label>
              Prayer Intention:
              <textarea
                value={intention}
                onChange={(event) => setIntention(event.target.value)}
                rows={4}
                style={{ width: "100%" }}
              />
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <label>
                Requested Start:
                <input type="date" value={rangeStart} onChange={(event) => setRangeStart(event.target.value)} style={{ width: "100%" }} />
              </label>
              <label>
                Requested End:
                <input type="date" value={rangeEnd} onChange={(event) => setRangeEnd(event.target.value)} style={{ width: "100%" }} />
              </label>
            </div>

            <button type="submit" disabled={submitting}>
              {submitting ? "Simulating..." : "Simulate Booking"}
            </button>
          </form>
        </>
      ) : null}

      {result ? (
        <div style={cardStyle}>
          <h3 style={{ marginTop: 0 }}>Simulation Result</h3>
          <p><strong>Reference:</strong> {result.simulation.bookingReference}</p>
          <p><strong>Status:</strong> {result.simulation.status}</p>
          <p><strong>Puja:</strong> {result.simulation.puja.en}</p>
          <p><strong>Temple:</strong> {result.simulation.temple.en}</p>
          <p><strong>Nakshatra:</strong> {result.simulation.nakshatra || "Not set"}</p>
          <p><strong>Waitlist Position:</strong> {result.simulation.waitlistPosition}</p>
          <p>
            <strong>Displayed Amount:</strong> {result.simulation.payment.presentedCurrency}{" "}
            {result.simulation.payment.presentedAmount}
          </p>
          <p><strong>USD Settlement Equivalent:</strong> ${result.simulation.payment.settlementAmountUsd}</p>
          <p><strong>Payment Mode:</strong> {result.simulation.payment.note}</p>
          <div>
            <strong>Timeline:</strong>
            <ul>
              {result.simulation.timeline.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </div>
  );
}
