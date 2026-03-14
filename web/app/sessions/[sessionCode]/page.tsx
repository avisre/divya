import { redirect } from "next/navigation";

export default async function SessionsRoomAliasPage({
  params,
  searchParams
}: {
  params: Promise<{ sessionCode: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { sessionCode } = await params;
  const rawSearch = await searchParams;
  const query = new URLSearchParams();

  Object.entries(rawSearch).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((entry) => query.append(key, entry));
      return;
    }
    if (typeof value === "string") {
      query.set(key, value);
    }
  });

  redirect(`/shared-prayer/${sessionCode}${query.toString() ? `?${query.toString()}` : ""}`);
}
