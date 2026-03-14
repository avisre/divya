import type { Prayer } from "./types";

function fallbackVerses(prayer: Prayer) {
  if (prayer.verses?.length) {
    return prayer.verses;
  }

  const script = prayer.content.devanagari || prayer.content.malayalam || prayer.content.english || "";
  const iast = prayer.iast || prayer.transliteration || "";
  const meaning = prayer.meaning || prayer.content.english || "";

  if (!script && !iast && !meaning) {
    return [];
  }

  return [
    {
      number: 1,
      script,
      iast,
      meaning,
      audioStartSec: 0
    }
  ];
}

export function enrichPrayer(prayer: Prayer) {
  const meaning = prayer.meaning || prayer.content.english || null;
  const iast = prayer.iast || prayer.transliteration || null;
  const transliteration = prayer.transliteration || prayer.iast || null;

  return {
    ...prayer,
    transliteration,
    iast,
    meaning,
    verseCount: prayer.verseCount || prayer.verses?.length || fallbackVerses(prayer).length,
    verses: prayer.verses?.length ? prayer.verses : fallbackVerses(prayer),
    content: {
      english: prayer.content.english || meaning,
      malayalam: prayer.content.malayalam || null,
      devanagari: prayer.content.devanagari || null
    }
  };
}

export function enrichPrayers(prayers: Prayer[]) {
  return prayers.map(enrichPrayer);
}
