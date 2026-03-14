const PLAYABLE_MEDIA_PROTOCOLS = new Set(["http:", "https:", "blob:", "data:"]);

export function isPlayableMediaUrl(value: string | null | undefined) {
  const trimmed = String(value || "").trim();
  if (!trimmed || trimmed.startsWith("raw://")) {
    return false;
  }

  if (trimmed.startsWith("/")) {
    return true;
  }

  try {
    const protocol = new URL(trimmed).protocol;
    return PLAYABLE_MEDIA_PROTOCOLS.has(protocol);
  } catch {
    return false;
  }
}

export function resolvePlayableAudioUrl(...candidates: Array<string | null | undefined>) {
  return candidates.find((candidate) => isPlayableMediaUrl(candidate)) || "";
}
