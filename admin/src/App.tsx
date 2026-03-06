import { useMemo, useState } from "react";
import { Link, Route, Routes } from "react-router-dom";
import type { AdminSession } from "./lib/adminApi";
import Dashboard from "./pages/Dashboard";
import Waitlist from "./pages/Waitlist";
import BookingDetail from "./pages/BookingDetail";
import VideoUpload from "./pages/VideoUpload";
import Analytics from "./pages/Analytics";
import BookingSimulator from "./pages/BookingSimulator";

const shellStyle: React.CSSProperties = {
  minHeight: "100vh",
  background: "linear-gradient(180deg, #fff8f0, #f8efe0)",
  color: "#32251C",
  fontFamily: "Georgia, serif",
};

const navStyle: React.CSSProperties = {
  display: "flex",
  gap: "16px",
  padding: "24px",
  borderBottom: "1px solid #e9d6b5",
  flexWrap: "wrap",
  alignItems: "center",
};

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("divya_admin_jwt") || "");
  const [baseUrl, setBaseUrl] = useState(
    localStorage.getItem("divya_admin_base_url") || import.meta.env.VITE_ADMIN_API_BASE_URL || "http://localhost:5000/api"
  );
  const simulatorEnabled = import.meta.env.DEV || import.meta.env.VITE_ENABLE_SIMULATOR === "true";

  const session: AdminSession = useMemo(
    () => ({ token, baseUrl }),
    [token, baseUrl]
  );

  const saveSession = () => {
    localStorage.setItem("divya_admin_jwt", token);
    localStorage.setItem("divya_admin_base_url", baseUrl);
  };

  return (
    <div style={shellStyle}>
      <nav style={navStyle}>
        <Link to="/">Dashboard</Link>
        <Link to="/waitlist">Waitlist</Link>
        {simulatorEnabled ? <Link to="/simulator">Booking Simulator</Link> : null}
        <Link to="/analytics">Analytics</Link>
        <input
          type="text"
          value={baseUrl}
          onChange={(event) => setBaseUrl(event.target.value)}
          placeholder="API Base URL"
          style={{ minWidth: 220, padding: "6px 10px", borderRadius: 10, border: "1px solid #c8af88" }}
        />
        <input
          type="password"
          value={token}
          onChange={(event) => setToken(event.target.value)}
          placeholder="Admin JWT"
          style={{ minWidth: 260, padding: "6px 10px", borderRadius: 10, border: "1px solid #c8af88" }}
        />
        <button
          type="button"
          onClick={saveSession}
          style={{ padding: "7px 12px", borderRadius: 10, border: "1px solid #c8af88", background: "#fff" }}
        >
          Save Session
        </button>
      </nav>
      <main style={{ padding: "24px" }}>
        <Routes>
          <Route path="/" element={<Dashboard session={session} />} />
          <Route path="/waitlist" element={<Waitlist session={session} />} />
          <Route path="/booking/:bookingId" element={<BookingDetail session={session} />} />
          <Route path="/video-upload/:bookingId" element={<VideoUpload session={session} />} />
          {simulatorEnabled ? <Route path="/simulator" element={<BookingSimulator baseUrl={baseUrl} />} /> : null}
          <Route path="/analytics" element={<Analytics session={session} />} />
        </Routes>
      </main>
    </div>
  );
}
