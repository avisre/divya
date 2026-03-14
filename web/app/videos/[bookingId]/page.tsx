import { redirect } from "next/navigation";

export default async function VideoPage({
  params
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = await params;
  redirect(`/bookings/${bookingId}/video`);
}
