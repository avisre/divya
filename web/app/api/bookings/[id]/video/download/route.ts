import { NextResponse } from "next/server";
import { fetchBackend } from "../../../../../../lib/backend";
import { getAuthToken } from "../../../../../../lib/session";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const token = await getAuthToken();
  if (!token) {
    return NextResponse.json({ message: "Authentication required." }, { status: 401 });
  }

  const { id } = await context.params;
  const video = await fetchBackend<{ url?: string | null }>(`/bookings/${id}/video`, { token }).catch(() => null);
  const signedUrl = video?.url?.trim();

  if (!signedUrl) {
    return NextResponse.json({ message: "Video is not ready for download." }, { status: 404 });
  }

  const upstream = await fetch(signedUrl, { cache: "no-store" });
  if (!upstream.ok || !upstream.body) {
    return NextResponse.json({ message: "Unable to fetch the sacred video archive." }, { status: 502 });
  }

  return new NextResponse(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": upstream.headers.get("Content-Type") || "video/mp4",
      "Content-Disposition": `attachment; filename="divya-booking-${id}.mp4"`,
      "Cache-Control": "private, no-store"
    }
  });
}
