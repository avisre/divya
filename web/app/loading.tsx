export default function Loading() {
  return (
    <div className="app-loading-screen" role="status" aria-live="polite" aria-label="Loading Prarthana">
      <div className="app-loading-screen__spinner" aria-hidden="true" />
      <div className="app-loading-screen__copy">
        <strong>Loading Prarthana</strong>
        <span>Preparing your next page.</span>
      </div>
    </div>
  );
}
