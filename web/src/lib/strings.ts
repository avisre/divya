import type { LocalizedText } from "@/lib/types";

export function textFor(value?: LocalizedText | null) {
  if (!value) return "";
  return value.en || value.ml || value.sa || "";
}

export function initials(name?: string) {
  return String(name || "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

