import { existsSync } from "fs";
import { readFile, stat } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

const RAW_AUDIO_DIR_CANDIDATES = [
  path.resolve(process.cwd(), "../androidApp/src/main/res/raw"),
  path.resolve(process.cwd(), "../../androidApp/src/main/res/raw"),
  path.resolve(process.cwd(), "public/prayers")
];
const AUDIO_EXTENSIONS = [".mp3", ".ogg", ".wav", ".m4a", ".aac"] as const;
const CONTENT_TYPES: Record<(typeof AUDIO_EXTENSIONS)[number], string> = {
  ".mp3": "audio/mpeg",
  ".ogg": "audio/ogg",
  ".wav": "audio/wav",
  ".m4a": "audio/mp4",
  ".aac": "audio/aac"
};

export const runtime = "nodejs";

function resolvePrayerAudioFile(resource: string) {
  if (!/^[a-z0-9_]+$/i.test(resource)) {
    return null;
  }

  const normalizedResource = resource.toLowerCase();

  for (const directory of RAW_AUDIO_DIR_CANDIDATES) {
    for (const extension of AUDIO_EXTENSIONS) {
      const candidate = path.join(directory, `${normalizedResource}${extension}`);
      if (existsSync(candidate)) {
        return {
          path: candidate,
          extension
        };
      }
    }
  }

  return null;
}

export async function GET(
  request: Request,
  context: { params: Promise<{ resource: string }> }
) {
  const { resource } = await context.params;
  const audioFile = resolvePrayerAudioFile(resource);

  if (!audioFile) {
    return NextResponse.json({ message: "Prayer audio not found." }, { status: 404 });
  }

  const fileStats = await stat(audioFile.path);
  const fileBuffer = await readFile(audioFile.path);
  const rangeHeader = request.headers.get("range");
  const contentType = CONTENT_TYPES[audioFile.extension] || "application/octet-stream";

  if (rangeHeader) {
    const match = rangeHeader.match(/bytes=(\d*)-(\d*)/i);
    if (match) {
      const start = match[1] ? Number(match[1]) : 0;
      const end = match[2] ? Number(match[2]) : fileStats.size - 1;
      const safeStart = Math.max(0, Math.min(start, fileStats.size - 1));
      const safeEnd = Math.max(safeStart, Math.min(end, fileStats.size - 1));
      const chunk = fileBuffer.subarray(safeStart, safeEnd + 1);

      return new NextResponse(chunk, {
        status: 206,
        headers: {
          "Accept-Ranges": "bytes",
          "Cache-Control": "public, max-age=604800, stale-while-revalidate=86400",
          "Content-Length": String(chunk.byteLength),
          "Content-Range": `bytes ${safeStart}-${safeEnd}/${fileStats.size}`,
          "Content-Type": contentType
        }
      });
    }
  }

  return new NextResponse(fileBuffer, {
    status: 200,
    headers: {
      "Accept-Ranges": "bytes",
      "Cache-Control": "public, max-age=604800, stale-while-revalidate=86400",
      "Content-Length": String(fileStats.size),
      "Content-Type": contentType
    }
  });
}
