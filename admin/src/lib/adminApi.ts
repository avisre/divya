export type AdminSession = {
  baseUrl: string;
  token: string;
};

export type AdminDashboard = {
  bookingsByStatus: Array<{ _id: string; count: number }>;
  revenue: { today: number; week: number; month: number };
  videoBacklogCount: number;
  newWaitlistJoinsToday: number;
};

export type AdminAnalytics = {
  prayerCompletionRate: number;
  pujaFunnel: { viewed: number; started: number; paid: number };
  videoWatchRate: number;
  dauWauByCountry: Array<{ country: string; dau: number; wau: number }>;
};

export type AdminBooking = {
  _id: string;
  bookingReference: string;
  devoteeName: string;
  status: string;
  waitlistPosition?: number;
  createdAt: string;
  paymentStatus: string;
  puja?: { name?: { en?: string }; type?: string };
  user?: { name?: string; email?: string };
  scheduledDate?: string;
  scheduledTimeIST?: string;
  videoShareUrl?: string;
};

function buildQuery(params: Record<string, string | undefined>) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      query.set(key, value);
    }
  });
  const queryString = query.toString();
  return queryString ? `?${queryString}` : "";
}

async function request<T>(session: AdminSession, path: string, init?: RequestInit): Promise<T> {
  if (!session.token.trim()) {
    throw new Error("Admin JWT is required");
  }

  const url = `${session.baseUrl.replace(/\/$/, "")}${path}`;
  const response = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${session.token.trim()}`,
      ...(init?.headers || {})
    }
  });

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const payload = await response.json();
      message = payload.message || payload.code || message;
    } catch {
      // ignore non-json error payloads
    }
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export function getDashboard(session: AdminSession) {
  return request<AdminDashboard>(session, "/admin/dashboard");
}

export function getAnalytics(session: AdminSession) {
  return request<AdminAnalytics>(session, "/admin/analytics");
}

export function getBookings(
  session: AdminSession,
  filters: {
    status?: string;
    paymentStatus?: string;
    dateFrom?: string;
    dateTo?: string;
    sort?: string;
  }
) {
  return request<AdminBooking[]>(session, `/admin/bookings${buildQuery(filters)}`);
}

export function getBookingById(session: AdminSession, bookingId: string) {
  return request<AdminBooking>(session, `/admin/bookings/${bookingId}`);
}

export function assignDate(
  session: AdminSession,
  bookingId: string,
  payload: { scheduledDate: string; scheduledTimeIST: string }
) {
  return request<AdminBooking>(session, `/admin/bookings/${bookingId}/assign-date`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
}

export function markInProgress(session: AdminSession, bookingId: string) {
  return request<AdminBooking>(session, `/admin/bookings/${bookingId}/mark-in-progress`, {
    method: "PUT"
  });
}

export function markCompleted(session: AdminSession, bookingId: string) {
  return request<AdminBooking>(session, `/admin/bookings/${bookingId}/mark-completed`, {
    method: "PUT"
  });
}

export function cancelBooking(session: AdminSession, bookingId: string) {
  return request<AdminBooking>(session, `/admin/bookings/${bookingId}/cancel`, {
    method: "PUT"
  });
}

export async function uploadVideo(session: AdminSession, bookingId: string, file: File) {
  const formData = new FormData();
  formData.append("video", file);
  return request<{ booking: AdminBooking }>(session, `/admin/bookings/${bookingId}/upload-video`, {
    method: "POST",
    body: formData
  });
}
