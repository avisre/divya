from __future__ import annotations

import argparse
import json
import re
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import yt_dlp


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_MANIFEST = ROOT / "scripts" / "prayer_youtube_manifest.json"

PREFERRED_CHANNEL_KEYWORDS = (
    "t-series",
    "tseries",
    "shemaroo",
    "saregama",
    "rajshri",
    "bhakti",
    "iskcon",
    "art of living",
    "vedic",
    "spiritual",
    "prabhupada",
)

BAD_TITLE_KEYWORDS = (
    "shorts",
    "status",
    "ringtone",
    "remix",
    "dj",
    "lofi",
    "8d",
)

QUERY_OVERRIDES = {
    "mahishasura_mardini_stotram": "Mahishasura Mardini Stotram full version Sanskrit",
    "navarna_mantra": "Navarna Mantra Om Aim Hrim Klim Chamundaye Viche 108 times",
    "gayatri_mantra": "Gayatri Mantra 108 times full",
    "ya_devi_sarvabhuteshu": "Ya Devi Sarvabhuteshu stotram full",
    "kerala_bhagavathi_stuti": "Kerala Bhagavathi Stuti Malayalam devotional song",
    "maha_mrityunjaya": "Maha Mrityunjaya Mantra 108 times",
    "om_chant": "Om Chanting 108 times",
    "om_tat_sat": "Om Tat Sat mantra chanting",
    "om_namo_bhagavate_vasudevaya": "Om Namo Bhagavate Vasudevaya mantra",
    "om_namah_shivaya": "Om Namah Shivaya chanting",
    "shanti_mantra": "Shanti Mantra Om Sahana Vavatu",
    "surya_mantra": "Surya Mantra Om Ghrini Suryaya Namah",
    "ganesh_aarti": "Ganesh Aarti Jai Ganesh Deva full",
    "lakshmi_aarti": "Lakshmi Aarti Om Jai Lakshmi Mata full",
    "saraswati_vandana": "Saraswati Vandana Ya Kundendu",
    "krishna_aarti": "Krishna Aarti Om Jai Jagdish Hare",
    "morning_prayer": "Pratah Smaranam morning prayer Sanskrit",
    "shiva_panchakshara": "Shiva Panchakshara Stotram full",
    "vishnu_sahasranama_108": "Vishnu Sahasranama 108 names",
    "hanuman_chalisa": "Hanuman Chalisa full",
    "durga_chalisa": "Durga Chalisa full",
    "nirvana_shatakam": "Nirvana Shatakam Adi Shankaracharya full",
    "lalitha_sahasranama_108": "Lalitha Sahasranama 108 names",
    "devi_kavacham_excerpt": "Devi Kavacham Durga Saptashati",
    "vakratunda_mahakaya": "Vakratunda Mahakaya mantra",
    "asato_ma_sadgamaya": "Asato Ma Sadgamaya mantra",
    "tvameva_mata": "Tvameva Mata Cha Pita Tvameva",
    "sarve_bhavantu_sukhinah": "Sarve Bhavantu Sukhinah mantra",
    "om_gan_ganapataye_namah": "Om Gan Ganapataye Namah mantra",
    "om_dum_durgayei_namaha": "Om Dum Durgayei Namaha mantra",
    "sri_rama_jaya_rama": "Sri Rama Jaya Rama Jaya Jaya Rama chant",
    "hare_rama_hare_krishna": "Hare Rama Hare Krishna Mahamantra",
    "annapurne_sadapurne": "Annapurne Sadapurne mantra",
    "guru_brahma_guru_vishnu": "Guru Brahma Guru Vishnu mantra",
    "om_namo_narayanaya": "Om Namo Narayanaya mantra",
    "om_shri_mahalakshmyai_namah": "Om Shri Mahalakshmyai Namah mantra",
}


@dataclass
class Choice:
    url: str
    title: str
    channel: str
    duration: int | None
    score: float


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Auto-fill prayer manifest YouTube links.")
    parser.add_argument("--manifest", default=str(DEFAULT_MANIFEST))
    parser.add_argument("--force", action="store_true", help="Replace existing URLs.")
    parser.add_argument("--search-size", type=int, default=8, help="Candidates per prayer.")
    return parser.parse_args()


def score_entry(query: str, entry: dict[str, Any]) -> float:
    title = str(entry.get("title") or "").lower()
    channel = str(entry.get("channel") or entry.get("uploader") or "").lower()
    url = str(entry.get("webpage_url") or "")
    duration = entry.get("duration")
    score = 0.0

    if not url.startswith("https://www.youtube.com/watch"):
        score -= 200

    if "shorts" in url:
        score -= 300

    for bad in BAD_TITLE_KEYWORDS:
        if bad in title:
            score -= 70

    if "official" in title:
        score += 16
    if "full" in title:
        score += 22
    if "complete" in title:
        score += 12
    if "audio" in title:
        score += 10
    if "108" in title and ("108" in query):
        score += 18

    for key in PREFERRED_CHANNEL_KEYWORDS:
        if key in channel:
            score += 28
            break

    if isinstance(duration, (int, float)):
        if 60 <= duration <= 5400:
            score += 25
        elif duration < 30:
            score -= 35
        elif duration > 9000:
            score -= 20
    else:
        score -= 5

    query_tokens = [tok for tok in re.split(r"[^a-z0-9]+", query.lower()) if len(tok) > 2]
    matched = sum(1 for token in query_tokens if token in title)
    score += matched * 2.0

    views = entry.get("view_count")
    if isinstance(views, (int, float)) and views > 0:
        score += min(20.0, (views / 1_000_000.0) * 4.0)

    return score


def pick_best(query: str, search_size: int) -> Choice | None:
    opts = {
        "quiet": True,
        "skip_download": True,
        "extract_flat": False,
        "noplaylist": True,
        "ignoreerrors": True,
        "nocheckcertificate": True,
        "no_warnings": True,
    }
    with yt_dlp.YoutubeDL(opts) as ydl:
        result = ydl.extract_info(f"ytsearch{search_size}:{query}", download=False)

    entries = result.get("entries") or []
    best: Choice | None = None
    for entry in entries:
        if not entry:
            continue
        url = str(entry.get("webpage_url") or "")
        if not url:
            continue
        score = score_entry(query, entry)
        choice = Choice(
            url=url,
            title=str(entry.get("title") or ""),
            channel=str(entry.get("channel") or entry.get("uploader") or ""),
            duration=entry.get("duration"),
            score=score,
        )
        if best is None or choice.score > best.score:
            best = choice
    return best


def build_query(resource_name: str, title: str) -> str:
    override = QUERY_OVERRIDES.get(resource_name)
    if override:
        return override
    return f"{title} full mantra audio"


def main() -> int:
    sys.stdout.reconfigure(encoding="utf-8")
    args = parse_args()
    manifest_path = Path(args.manifest).expanduser().resolve()
    data = json.loads(manifest_path.read_text(encoding="utf-8"))
    items = data.get("items", [])

    updated = 0
    skipped = 0
    unresolved = 0
    for index, item in enumerate(items, start=1):
        resource_name = str(item.get("resource_name", "")).strip()
        title = str(item.get("title", resource_name)).strip()
        current_url = str(item.get("url", "")).strip()

        if current_url and not args.force:
            skipped += 1
            continue

        query = build_query(resource_name, title)
        choice = pick_best(query, args.search_size)
        if not choice:
            unresolved += 1
            print(f"[{index}/{len(items)}] MISS  {resource_name}")
            continue

        item["url"] = choice.url
        item["sourceTitle"] = choice.title
        item["sourceChannel"] = choice.channel
        item["sourceDuration"] = choice.duration
        item["sourceScore"] = round(choice.score, 2)
        updated += 1
        print(f"[{index}/{len(items)}] LINK  {resource_name} -> {choice.url}")

    manifest_path.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"[DONE] updated={updated} skipped={skipped} unresolved={unresolved} manifest={manifest_path}")
    return 0 if unresolved == 0 else 2


if __name__ == "__main__":
    raise SystemExit(main())
