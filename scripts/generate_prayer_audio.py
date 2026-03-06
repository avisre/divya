from __future__ import annotations

import asyncio
import re
from dataclasses import dataclass
from pathlib import Path

import edge_tts


ROOT = Path(__file__).resolve().parents[1]
CONTENT_FILE = ROOT / "androidApp" / "src" / "main" / "java" / "com" / "divya" / "android" / "ui" / "screens" / "AppContent.kt"
RAW_DIR = ROOT / "androidApp" / "src" / "main" / "res" / "raw"
FALLBACK_VOICE = "en-IN-NeerjaExpressiveNeural"
DEVANAGARI_VOICE = "hi-IN-SwaraNeural"
MALAYALAM_VOICE = "ml-IN-SobhanaNeural"
RATE = "-12%"
VOLUME = "+0%"
LANGUAGE_HINTS = {
    "ml": "Malayalam",
    "sa": "Sanskrit",
    "en": "English",
}

SLUG_TEXT_OVERRIDES = {
    "navarna-mantra": "ॐ ऐं ह्रीं क्लीं चामुण्डायै विच्चे",
    "gayatri-mantra": "ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि धियो यो नः प्रचोदयात्",
    "maha-mrityunjaya": "ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम् उर्वारुकमिव बन्धनान् मृत्योर्मुक्षीय मा अमृतात्",
    "ya-devi-sarvabhuteshu": "या देवी सर्वभूतेषु शक्तिरूपेण संस्थिता नमस्तस्यै नमस्तस्यै नमस्तस्यै नमो नमः",
    "om-namah-shivaya": "ॐ नमः शिवाय",
    "shanti-mantra": "ॐ सह नाववतु। सह नौ भुनक्तु। सह वीर्यं करवावहै। तेजस्विनावधीतमस्तु मा विद्विषावहै। ॐ शान्तिः शान्तिः शान्तिः।",
    "surya-mantra": "ॐ घृणि सूर्याय नमः",
    "vakratunda-mahakaya": "वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ। निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा॥",
    "asato-ma-sadgamaya": "असतो मा सद्गमय। तमसो मा ज्योतिर्गमय। मृत्योर्मा अमृतं गमय। ॐ शान्तिः शान्तिः शान्तिः॥",
    "tvameva-mata": "त्वमेव माता च पिता त्वमेव। त्वमेव बन्धुश्च सखा त्वमेव। त्वमेव विद्या द्रविणं त्वमेव। त्वमेव सर्वं मम देव देव॥",
    "sarve-bhavantu-sukhinah": "सर्वे भवन्तु सुखिनः। सर्वे सन्तु निरामयाः। सर्वे भद्राणि पश्यन्तु। मा कश्चिद्दुःखभाग्भवेत्। ॐ शान्तिः शान्तिः शान्तिः॥",
    "om-gan-ganapataye-namah": "ॐ गं गणपतये नमः",
    "om-dum-durgayei-namaha": "ॐ दुं दुर्गायै नमः",
    "sri-rama-jaya-rama": "श्री राम जय राम जय जय राम",
    "hare-rama-hare-krishna": "हरे राम हरे राम राम राम हरे हरे। हरे कृष्ण हरे कृष्ण कृष्ण कृष्ण हरे हरे॥",
    "annapurne-sadapurne": "अन्नपूर्णे सदापूर्णे शङ्करप्राणवल्लभे। ज्ञानवैराग्यसिद्ध्यर्थं भिक्षां देहि च पार्वति॥",
    "guru-brahma-guru-vishnu": "गुरुर्ब्रह्मा गुरुर्विष्णुः गुरुर्देवो महेश्वरः। गुरुः साक्षात् परब्रह्म तस्मै श्रीगुरवे नमः॥",
    "om-namo-narayanaya": "ॐ नमो नारायणाय",
    "om-shri-mahalakshmyai-namah": "ॐ श्री महालक्ष्म्यै नमः",
}


@dataclass
class PrayerEntry:
    var_name: str
    title: str
    slug: str
    transliteration: str
    devanagari: str | None
    malayalam: str | None
    audio_url: str | None
    block: str

    @property
    def resource_name(self) -> str:
        return self.slug.replace("-", "_")

    @property
    def media_path(self) -> Path | None:
        existing = next(iter(sorted(RAW_DIR.glob(f"{self.resource_name}.*"))), None)
        if existing and existing.suffix.lower() in {".ogg", ".oga"}:
            return None
        if existing and existing.suffix.lower() == ".mp3":
            return existing
        return RAW_DIR / f"{self.resource_name}.mp3"

    @property
    def needs_audio(self) -> bool:
        return not (self.audio_url and self.audio_url.startswith("raw://"))

    @property
    def synthesis_text(self) -> str:
        if self.slug in SLUG_TEXT_OVERRIDES:
            return SLUG_TEXT_OVERRIDES[self.slug]
        if self.malayalam and self.slug == "kerala-bhagavathi-stuti":
            return self.malayalam
        if self.devanagari:
            return self.devanagari
        return normalize_text(self.transliteration, self.slug)

    @property
    def voice(self) -> str:
        if self.malayalam and self.slug == "kerala-bhagavathi-stuti":
            return MALAYALAM_VOICE
        if self.devanagari or self.slug in SLUG_TEXT_OVERRIDES:
            return DEVANAGARI_VOICE
        return FALLBACK_VOICE


def read_entries() -> tuple[str, list[PrayerEntry]]:
    text = CONTENT_FILE.read_text(encoding="utf-8")
    lines = text.splitlines()
    entries: list[PrayerEntry] = []
    in_block = False
    block_lines: list[str] = []
    var_name = ""
    depth = 0

    for line in lines:
        match = re.match(r"\s*val\s+(\w+)\s*=\s*(Prayer|simplePrayer)\(", line)
        if not in_block and match:
            in_block = True
            var_name = match.group(1)
            block_lines = [line]
            depth = line.count("(") - line.count(")")
            continue

        if in_block:
            block_lines.append(line)
            depth += line.count("(") - line.count(")")
            if depth <= 0:
                block = "\n".join(block_lines)
                title = (
                    extract(block, r'nameEn\s*=\s*"([^"]+)"')
                    or extract(block, r'title\s*=\s*LocalizedText\((?:.|\n)*?en\s*=\s*"([^"]+)"')
                    or var_name
                )
                slug = extract(block, r'slug\s*=\s*"([^"]+)"') or var_name
                transliteration = (
                    extract_string_value(block, "transliteration")
                    or extract_string_value(block, "iast")
                    or extract_string_value(block, "english")
                    or title
                )
                devanagari = extract_string_value(block, "devanagari")
                malayalam = extract_string_value(block, "malayalam")
                audio_raw = extract(block, r'audioUrl\s*=\s*(null|"[^"]+"|raw://[A-Za-z0-9_]+)')
                if audio_raw is None:
                    audio_url = None
                elif audio_raw == "null":
                    audio_url = None
                else:
                    audio_url = audio_raw.strip('"')
                entries.append(
                    PrayerEntry(
                        var_name=var_name,
                        title=title,
                        slug=slug,
                        transliteration=normalize_text(transliteration, slug),
                        devanagari=normalize_script_text(devanagari),
                        malayalam=normalize_script_text(malayalam),
                        audio_url=audio_url,
                        block=block,
                    )
                )
                in_block = False
                block_lines = []
                var_name = ""
                depth = 0

    return text, entries


def extract(text: str, pattern: str) -> str | None:
    match = re.search(pattern, text, re.S)
    return match.group(1) if match else None


def extract_string_value(text: str, field_name: str) -> str | None:
    pattern = rf'{field_name}\s*=\s*(?:"""(.*?)"""(?:\.trimIndent\(\))?|"([^"]*)"|null)'
    match = re.search(pattern, text, re.S)
    if not match:
        return None
    return match.group(1) if match.group(1) is not None else match.group(2)


def normalize_text(text: str, slug: str = "") -> str:
    replacements = {
        "Aim": "Ayeem",
        "Hrim": "Hreem",
        "Klim": "Kleem",
        "Camundayai": "Chamundaye",
        "Camundayai": "Chamundaye",
        "Vicce": "Viche",
        "Tryambakam": "Triyambakam",
        "bhur": "bhoor",
        "bhuvah": "bhuvaha",
        "svah": "swaha",
        "shaktirupena": "shakthiroopena",
        "saktirupena": "shaktirupena",
        "visva": "vishwa",
        "Tusharahara": "Tushara Hara",
        "Pratah Smaranam": "Pratah Smaranam",
        "Namah": "Namaha",
        "Namo": "Namoh",
        "Shantih": "Shaantih",
        "Vishnuh": "Vishnuhu",
        "Maheshvarah": "Maheshwaraha",
    }
    normalized = " ".join(text.replace("...", " ").split())
    for source, target in replacements.items():
        normalized = normalized.replace(source, target)
    if slug == "hare-rama-hare-krishna":
        normalized = normalized.replace("Krishna", "Krish-na")
    return normalized


def normalize_script_text(text: str | None) -> str | None:
    if not text:
        return None
    normalized = " ".join(text.replace("।", "। ").replace("॥", "॥ ").split())
    return normalized.strip()


async def synthesize(entry: PrayerEntry) -> None:
    if entry.media_path is None:
        return
    text = entry.synthesis_text
    communicate = edge_tts.Communicate(
        text=text,
        voice=entry.voice,
        rate=RATE,
        volume=VOLUME,
    )
    await communicate.save(str(entry.media_path))


def update_content_file(original_text: str, entries: list[PrayerEntry]) -> None:
    updated = original_text
    for entry in entries:
        if not entry.needs_audio:
            continue
        replacement = f'audioUrl = "raw://{entry.resource_name}"'
        block = entry.block
        if re.search(r'audioUrl\s*=\s*(null|"[^"]+")', block):
            new_block = re.sub(r'audioUrl\s*=\s*(null|"[^"]+")', replacement, block)
        else:
            new_block = re.sub(
                r'(recommendedRepetitions\s*=\s*\[[^\]]+\],)',
                r"\1\n        " + replacement + ",",
                block,
                count=1,
            )
        updated = updated.replace(block, new_block)
    CONTENT_FILE.write_text(updated, encoding="utf-8")


async def main() -> None:
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    original_text, entries = read_entries()
    missing = [entry for entry in entries if entry.needs_audio]
    for entry in missing:
        if entry.media_path and entry.media_path.exists():
            continue
        await synthesize(entry)
    update_content_file(original_text, missing)


if __name__ == "__main__":
    asyncio.run(main())
