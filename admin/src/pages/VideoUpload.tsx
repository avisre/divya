import { useState } from "react";
import { useParams } from "react-router-dom";
import VideoDropzone from "../components/VideoDropzone";
import type { AdminSession } from "../lib/adminApi";
import { uploadVideo } from "../lib/adminApi";

type Props = {
  session: AdminSession;
};

export default function VideoUpload({ session }: Props) {
  const { bookingId } = useParams();
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const onUpload = async () => {
    if (!bookingId || !file) {
      return;
    }
    setUploading(true);
    setMessage(null);
    setError(null);
    try {
      const result = await uploadVideo(session, bookingId, file);
      setMessage(`Video uploaded. Status: ${result.booking.status}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <h1>Video Upload</h1>
      <p>Booking: {bookingId}</p>
      <VideoDropzone onSelectFile={setFile} selectedFileName={file?.name} />
      <button type="button" onClick={() => void onUpload()} disabled={!file || uploading} style={{ marginTop: 12 }}>
        {uploading ? "Uploading..." : "Upload Video"}
      </button>
      {message ? <p style={{ color: "#0a6f2a" }}>{message}</p> : null}
      {error ? <p style={{ color: "#8b2c00" }}>{error}</p> : null}
    </div>
  );
}
