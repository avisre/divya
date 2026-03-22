const PLAYABLE_MEDIA_PROTOCOLS = new Set(["http:", "https:", "blob:", "data:"]);
const RAW_AUDIO_PATTERN = /^raw:\/\/([a-z0-9_]+)$/i;

export function resolveBundledPrayerAudioUrl(value: string | null | undefined) {
  const trimmed = String(value || "").trim();
  const match = trimmed.match(RAW_AUDIO_PATTERN);
  if (!match) {
    return "";
  }

  return `/api/prayer-audio/${match[1].toLowerCase()}`;
}

export function isPlayableMediaUrl(value: string | null | undefined) {
  const trimmed = String(value || "").trim();
  if (!trimmed) {
    return false;
  }

  if (resolveBundledPrayerAudioUrl(trimmed)) {
    return true;
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
  for (const candidate of candidates) {
    const bundledAudioUrl = resolveBundledPrayerAudioUrl(candidate);
    if (bundledAudioUrl) {
      return bundledAudioUrl;
    }
  }

  for (const candidate of candidates) {
    if (isPlayableMediaUrl(candidate)) {
      return String(candidate || "").trim();
    }
  }

  return "";
}
