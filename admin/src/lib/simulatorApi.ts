export type SimulatorBootstrap = {
  temple: {
    id: string;
    name: { en: string; ml?: string; sa?: string };
    tradition: string;
    timezone: string;
    nriNote?: string;
    location?: {
      city?: string;
      district?: string;
      state?: string;
      country?: string;
    };
  };
  pujas: Array<{
    id: string;
    name: { en: string; ml?: string; sa?: string };
    type: string;
    duration: number;
    estimatedWaitWeeks: number;
    requirements: string[];
    bestFor: string[];
    description?: { short?: string; full?: string };
    displayPrice: { amount: number; currency: string };
  }>;
  defaults: {
    currency: string;
    timezone: string;
    gothram: string;
  };
};

export type SimulatedBooking = {
  simulation: {
    bookingReference: string;
    status: string;
    temple: { en: string; ml?: string; sa?: string };
    puja: { en: string; ml?: string; sa?: string };
    devoteeName: string;
    gothram: string;
    nakshatra: string | null;
    timezone: string;
    waitlistPosition: number;
    estimatedWaitWeeks: number;
    estimatedTempleDate: string;
    payment: {
      presentedAmount: number;
      presentedCurrency: string;
      settlementAmountUsd: number;
      settlementCurrency: string;
      mode: string;
      note: string;
    };
    intention: {
      text: string;
      requiresReview: boolean;
    };
    timeline: string[];
  };
};

type NakshatraResponse = {
  number: number;
  name: string;
  nameHi: string;
  deity: string;
};

async function request<T>(baseUrl: string, path: string, init?: RequestInit): Promise<T> {
  const url = `${baseUrl.replace(/\/$/, "")}${path}`;
  const response = await fetch(url, init);
  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const payload = await response.json();
      message = payload.message || payload.code || message;
    } catch {
      // ignore parse errors
    }
    throw new Error(message);
  }
  return response.json() as Promise<T>;
}

export function fetchSimulatorBootstrap(baseUrl: string, currency: string) {
  return request<SimulatorBootstrap>(
    baseUrl,
    `/simulator/bootstrap?currency=${encodeURIComponent(currency)}`
  );
}

export function calculateNakshatra(
  baseUrl: string,
  payload: { birthDate: string; birthTime: string; timezone: string }
) {
  return request<NakshatraResponse>(baseUrl, "/nakshatra/calculate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
}

export function simulateBooking(
  baseUrl: string,
  payload: {
    pujaId: string;
    devoteeName: string;
    gothram: string;
    nakshatra?: string;
    birthDate?: string;
    birthTime?: string;
    timezone: string;
    prayerIntention: string;
    currency: string;
    requestedDateRange?: { start?: string; end?: string };
  }
) {
  return request<SimulatedBooking>(baseUrl, "/simulator/booking", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
}
