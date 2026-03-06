from __future__ import annotations

import argparse
import datetime as dt
import importlib.util
import json
import os
import re
import shlex
import shutil
import subprocess
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_MANIFEST = ROOT / "scripts" / "prayer_youtube_manifest.json"
DEFAULT_OUTPUT_DIR = ROOT / "androidApp" / "src" / "main" / "res" / "raw"
RESOURCE_CLEANUP = re.compile(r"[^a-z0-9_]+")


@dataclass(frozen=True)
class ManifestItem:
    resource_name: str
    title: str
    url: str


@dataclass(frozen=True)
class DownloaderDeps:
    yt_dlp_cmd: list[str]
    ffmpeg_location: Path | None


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Batch-download licensed YouTube prayer media with yt-dlp and "
            "save Android-safe filenames into res/raw."
        )
    )
    parser.add_argument(
        "--manifest",
        default=str(DEFAULT_MANIFEST),
        help="Path to JSON manifest. Default: scripts/prayer_youtube_manifest.json",
    )
    parser.add_argument(
        "--output-dir",
        default=str(DEFAULT_OUTPUT_DIR),
        help="Directory where media files are saved.",
    )
    parser.add_argument(
        "--kind",
        choices=("audio", "video"),
        default="audio",
        help="Download audio-only (default) or full video.",
    )
    parser.add_argument(
        "--audio-format",
        choices=("mp3", "m4a", "wav"),
        default="mp3",
        help="Audio output format when --kind audio.",
    )
    parser.add_argument(
        "--audio-quality",
        default="0",
        help="yt-dlp audio quality setting (0 is best).",
    )
    parser.add_argument(
        "--video-container",
        choices=("mp4", "mkv", "webm"),
        default="mp4",
        help="Merged video container when --kind video.",
    )
    parser.add_argument(
        "--video-format-selector",
        default="bv*+ba/b",
        help="yt-dlp -f selector for video mode.",
    )
    parser.add_argument(
        "--cookies-from-browser",
        help=(
            "Optional browser name for yt-dlp cookie extraction, "
            "for example: chrome, edge, firefox."
        ),
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print commands without downloading files.",
    )
    parser.add_argument(
        "--stop-on-error",
        action="store_true",
        help="Stop immediately if a download fails.",
    )
    parser.add_argument(
        "--write-map",
        help=(
            "Optional output JSON path for a resource map "
            "(resource_name -> raw://resource_name)."
        ),
    )
    parser.set_defaults(skip_existing=True)
    parser.add_argument(
        "--skip-existing",
        dest="skip_existing",
        action="store_true",
        help="Skip files that already exist (default).",
    )
    parser.add_argument(
        "--overwrite",
        dest="skip_existing",
        action="store_false",
        help="Overwrite existing files.",
    )
    return parser.parse_args()


def to_resource_name(raw_value: str, fallback: str) -> str:
    normalized = raw_value.strip().lower().replace("-", "_").replace(" ", "_")
    normalized = RESOURCE_CLEANUP.sub("_", normalized)
    normalized = re.sub(r"_+", "_", normalized).strip("_")
    if not normalized:
        normalized = fallback
    if not normalized or not normalized[0].isalpha():
        normalized = f"p_{normalized}"
    return normalized


def load_manifest(path: Path) -> list[ManifestItem]:
    if not path.exists():
        raise FileNotFoundError(f"Manifest not found: {path}")

    try:
        parsed: Any = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        raise ValueError(f"Invalid JSON in manifest {path}: {exc}") from exc

    rows = parsed.get("items") if isinstance(parsed, dict) else parsed
    if not isinstance(rows, list):
        raise ValueError("Manifest must be a JSON list or an object with an 'items' array.")

    items: list[ManifestItem] = []
    seen_names: dict[str, int] = {}
    for index, row in enumerate(rows, start=1):
        if not isinstance(row, dict):
            print(f"[WARN] Skipping entry #{index}: expected object.", file=sys.stderr)
            continue

        url = str(row.get("url", "")).strip()
        if not url:
            print(f"[WARN] Skipping entry #{index}: missing url.", file=sys.stderr)
            continue
        if not (url.startswith("https://") or url.startswith("http://")):
            print(f"[WARN] Skipping entry #{index}: invalid url '{url}'.", file=sys.stderr)
            continue

        source_name = row.get("resource_name") or row.get("slug") or row.get("title") or row.get("name")
        source_name = str(source_name or f"prayer_{index:02d}")
        candidate_name = to_resource_name(source_name, f"prayer_{index:02d}")

        duplicate_count = seen_names.get(candidate_name, 0)
        seen_names[candidate_name] = duplicate_count + 1
        resource_name = candidate_name if duplicate_count == 0 else f"{candidate_name}_{duplicate_count + 1}"

        title = str(row.get("title") or row.get("name") or resource_name).strip()
        items.append(ManifestItem(resource_name=resource_name, title=title, url=url))

    return items


def detect_ffmpeg() -> Path | None:
    explicit = shutil.which("ffmpeg")
    if explicit:
        return Path(explicit).resolve()

    local = os.environ.get("LOCALAPPDATA")
    if local:
        base = Path(local) / "Microsoft" / "WinGet" / "Packages"
        if base.exists():
            matches = sorted(base.glob("Gyan.FFmpeg*/**/bin/ffmpeg.exe"))
            if matches:
                return matches[-1].resolve()

    return None


def ensure_dependencies(kind: str) -> DownloaderDeps:
    yt_dlp_exe = shutil.which("yt-dlp")
    if yt_dlp_exe:
        yt_dlp_cmd = [yt_dlp_exe]
    elif importlib.util.find_spec("yt_dlp") is not None:
        yt_dlp_cmd = [sys.executable, "-m", "yt_dlp"]
    else:
        raise RuntimeError(
            "yt-dlp is not installed. Install with: python -m pip install yt-dlp"
        )

    ffmpeg_location = detect_ffmpeg()
    if kind in {"audio", "video"} and ffmpeg_location is None:
        raise RuntimeError(
            "ffmpeg not found. Install ffmpeg and ensure it is on PATH, "
            "or install via winget (Gyan.FFmpeg)."
        )

    return DownloaderDeps(yt_dlp_cmd=yt_dlp_cmd, ffmpeg_location=ffmpeg_location)


def target_extension(args: argparse.Namespace) -> str:
    return args.audio_format if args.kind == "audio" else args.video_container


def build_command(
    item: ManifestItem,
    output_dir: Path,
    args: argparse.Namespace,
    deps: DownloaderDeps,
) -> list[str]:
    command = [
        *deps.yt_dlp_cmd,
        "--no-playlist",
        "--newline",
        "--no-warnings",
        "--restrict-filenames",
        "--force-overwrites",
        "--no-continue",
        "--no-part",
        "--js-runtimes",
        "node",
        "--remote-components",
        "ejs:github",
    ]

    if args.cookies_from_browser:
        command.extend(["--cookies-from-browser", args.cookies_from_browser])

    if deps.ffmpeg_location is not None:
        command.extend(["--ffmpeg-location", str(deps.ffmpeg_location.parent)])

    output_template = output_dir / f"{item.resource_name}.%(ext)s"
    command.extend(["-o", str(output_template)])

    if args.kind == "audio":
        command.extend(
            [
                "-f",
                "bestaudio/best",
                "--extract-audio",
                "--audio-format",
                args.audio_format,
                "--audio-quality",
                args.audio_quality,
            ]
        )
    else:
        command.extend(
            [
                "-f",
                args.video_format_selector,
                "--merge-output-format",
                args.video_container,
            ]
        )

    command.append(item.url)
    return command


def maybe_write_map(path: Path, items: list[ManifestItem]) -> None:
    payload = {
        "generatedAtUtc": dt.datetime.now(dt.timezone.utc).isoformat(),
        "items": [
            {
                "resource_name": item.resource_name,
                "audio_url": f"raw://{item.resource_name}",
                "source_url": item.url,
                "title": item.title,
            }
            for item in items
        ],
    }
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    print(f"[INFO] Wrote resource map: {path}")


def main() -> int:
    args = parse_args()
    manifest_path = Path(args.manifest).expanduser().resolve()
    output_dir = Path(args.output_dir).expanduser().resolve()

    try:
        deps = ensure_dependencies(args.kind)
        items = load_manifest(manifest_path)
    except Exception as exc:  # pragma: no cover
        print(f"[ERROR] {exc}", file=sys.stderr)
        return 1

    if not items:
        print("[ERROR] No valid manifest entries found.", file=sys.stderr)
        return 1

    output_dir.mkdir(parents=True, exist_ok=True)
    ext = target_extension(args)
    print(f"[INFO] Manifest: {manifest_path}")
    print(f"[INFO] Output dir: {output_dir}")
    print(f"[INFO] Mode: {args.kind} -> .{ext}")
    print(f"[INFO] Items: {len(items)}")
    print(f"[INFO] yt-dlp command: {' '.join(deps.yt_dlp_cmd)}")
    if deps.ffmpeg_location:
        print(f"[INFO] ffmpeg: {deps.ffmpeg_location}")

    failed = 0
    downloaded = 0
    skipped = 0

    for index, item in enumerate(items, start=1):
        final_path = output_dir / f"{item.resource_name}.{ext}"
        if args.skip_existing and final_path.exists():
            skipped += 1
            print(f"[{index}/{len(items)}] SKIP {item.resource_name} (already exists)")
            continue

        command = build_command(item, output_dir, args, deps)
        print(f"[{index}/{len(items)}] DOWN {item.resource_name} <- {item.url}")

        if args.dry_run:
            print("  " + " ".join(shlex.quote(part) for part in command))
            downloaded += 1
            continue

        result = subprocess.run(command, check=False)
        if result.returncode != 0:
            failed += 1
            print(f"  [FAIL] Exit code {result.returncode}: {item.resource_name}", file=sys.stderr)
            if args.stop_on_error:
                break
            continue

        downloaded += 1

    if args.write_map:
        maybe_write_map(Path(args.write_map).expanduser().resolve(), items)

    print(
        f"[DONE] downloaded={downloaded} skipped={skipped} failed={failed} "
        f"(dry_run={args.dry_run})"
    )
    return 0 if failed == 0 else 2


if __name__ == "__main__":
    raise SystemExit(main())
