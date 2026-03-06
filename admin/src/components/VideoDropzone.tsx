type Props = {
  onSelectFile: (file: File) => void;
  selectedFileName?: string;
};

export default function VideoDropzone({ onSelectFile, selectedFileName }: Props) {
  return (
    <div
      style={{
        border: "2px dashed #d9a826",
        borderRadius: 24,
        padding: 48,
        textAlign: "center",
        background: "#fffdf8",
      }}
    >
      <input
        type="file"
        accept="video/mp4,video/*"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            onSelectFile(file);
          }
        }}
      />
      <div style={{ marginTop: 8 }}>
        Drop puja video here (MP4, max 2GB)
      </div>
      {selectedFileName ? <div style={{ marginTop: 6 }}>Selected: {selectedFileName}</div> : null}
    </div>
  );
}
