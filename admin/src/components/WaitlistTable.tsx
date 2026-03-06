import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { AdminBooking, AdminSession } from "../lib/adminApi";
import { assignDate, cancelBooking, getBookings, markCompleted, markInProgress } from "../lib/adminApi";
import BookingStatusPill from "./BookingStatusPill";

type Props = {
  session: AdminSession;
};

function formatDate(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function ActionButton({
  label,
  onClick,
  disabled
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        border: "1px solid #d8bf98",
        background: "#fff",
        borderRadius: 8,
        padding: "4px 8px",
        fontSize: 12,
        cursor: "pointer"
      }}
    >
      {label}
    </button>
  );
}

export default function WaitlistTable({ session }: Props) {
  const [status, setStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sort, setSort] = useState("waitlist");
  const [rows, setRows] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  const reload = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getBookings(session, {
        status: status || undefined,
        paymentStatus: paymentStatus || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        sort: sort === "joinDate" ? "join_date" : undefined
      });
      setRows(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load waitlist");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
  }, [session, status, paymentStatus, dateFrom, dateTo, sort]);

  const runAction = async (bookingId: string, action: () => Promise<unknown>) => {
    setPendingAction(bookingId);
    setError(null);
    try {
      await action();
      await reload();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Action failed");
    } finally {
      setPendingAction(null);
    }
  };

  const handleAssignDate = async (booking: AdminBooking) => {
    const scheduledDate = window.prompt("Enter scheduled date (YYYY-MM-DD)", booking.scheduledDate?.slice(0, 10) || "");
    if (!scheduledDate) return;
    const scheduledTimeIST = window.prompt("Enter IST time (e.g., 06:30 PM IST)", booking.scheduledTimeIST || "06:30 PM IST");
    if (!scheduledTimeIST) return;
    await runAction(booking._id, () => assignDate(session, booking._id, { scheduledDate, scheduledTimeIST }));
  };

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <select value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="">All statuses</option>
          <option value="waitlisted">Waitlisted</option>
          <option value="confirmed">Confirmed</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="video_ready">Video Ready</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select value={paymentStatus} onChange={(event) => setPaymentStatus(event.target.value)}>
          <option value="">All payments</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
        <input type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} />
        <input type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} />
        <select value={sort} onChange={(event) => setSort(event.target.value)}>
          <option value="waitlist">Sort: Waitlist Position</option>
          <option value="joinDate">Sort: Join Date</option>
        </select>
        <button type="button" onClick={reload}>
          Refresh
        </button>
      </div>
      {error ? <div style={{ color: "#8b2c00" }}>{error}</div> : null}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Reference #</th>
            <th>Devotee Name</th>
            <th>Puja</th>
            <th>Status</th>
            <th>Waitlist Position</th>
            <th>Joined Date</th>
            <th>Payment Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={8} style={{ padding: 12 }}>
                Loading waitlist...
              </td>
            </tr>
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={8} style={{ padding: 12 }}>
                No bookings found for the selected filters.
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row._id}>
                <td>{row.bookingReference}</td>
                <td>{row.devoteeName}</td>
                <td>{row.puja?.name?.en || "-"}</td>
                <td>
                  <BookingStatusPill status={row.status} />
                </td>
                <td>{row.waitlistPosition ?? "-"}</td>
                <td>{formatDate(row.createdAt)}</td>
                <td>{row.paymentStatus}</td>
                <td style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <Link to={`/booking/${row._id}`}>Open</Link>
                  <Link to={`/video-upload/${row._id}`}>Upload Video</Link>
                  <ActionButton
                    label="Assign Date"
                    disabled={pendingAction === row._id}
                    onClick={() => {
                      void handleAssignDate(row);
                    }}
                  />
                  <ActionButton
                    label="In Progress"
                    disabled={pendingAction === row._id}
                    onClick={() => {
                      void runAction(row._id, () => markInProgress(session, row._id));
                    }}
                  />
                  <ActionButton
                    label="Completed"
                    disabled={pendingAction === row._id}
                    onClick={() => {
                      void runAction(row._id, () => markCompleted(session, row._id));
                    }}
                  />
                  <ActionButton
                    label="Cancel"
                    disabled={pendingAction === row._id}
                    onClick={() => {
                      if (window.confirm("Cancel this booking and trigger refund if applicable?")) {
                        void runAction(row._id, () => cancelBooking(session, row._id));
                      }
                    }}
                  />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
