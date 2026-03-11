"use client";

import { useEffect, useMemo, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { BACKEND_ORIGIN } from "../../lib/env";
import { sendJson } from "../../lib/client-api";
import { Button } from "../ui/Button";
import { StatusStrip } from "../ui/StatusStrip";
import type { SharedPrayerSession, UserSession } from "../../lib/types";

let socket: Socket | null = null;

function getSocket() {
  if (!socket) {
    socket = io(BACKEND_ORIGIN, {
      transports: ["websocket"]
    });
  }
  return socket;
}

export function SharedPrayerClient({
  initialSession,
  user
}: {
  initialSession: SharedPrayerSession;
  user: UserSession;
}) {
  const [session, setSession] = useState(initialSession);
  const [events, setEvents] = useState<string[]>([]);

  const prayerTitle = useMemo(() => {
    return typeof session.prayerId === "string" ? "Shared prayer session" : session.prayerId.title.en;
  }, [session.prayerId]);

  useEffect(() => {
    const activeSocket = getSocket();
    activeSocket.emit("join_session", { sessionCode: session.sessionCode, userId: user.id, name: user.name });
    const pushEvent = (value: string) => setEvents((current) => [value, ...current].slice(0, 6));

    activeSocket.on("participant_joined", (payload) => pushEvent(`${payload.name} joined.`));
    activeSocket.on("participant_left", (payload) => pushEvent(`${payload.name} left.`));
    activeSocket.on("rep_counted", (payload) => {
      pushEvent(`Repetition ${payload.completedReps} of ${payload.totalReps}.`);
      setSession((current) => ({ ...current, currentRepetition: payload.completedReps }));
    });
    activeSocket.on("session_started", () => pushEvent("Session started."));
    activeSocket.on("session_ended", () => pushEvent("Session completed."));

    return () => {
      activeSocket.off("participant_joined");
      activeSocket.off("participant_left");
      activeSocket.off("rep_counted");
      activeSocket.off("session_started");
      activeSocket.off("session_ended");
    };
  }, [session.sessionCode, user.id, user.name]);

  return (
    <div className="page-stack">
      <div className="surface-card">
        <h3>{prayerTitle}</h3>
        <p>
          Session code <strong>{session.sessionCode}</strong> • {session.status}
        </p>
        <StatusStrip tone="neutral">
          Completed repetitions: {session.currentRepetition || 0}/{session.totalRepetitions || 0}
        </StatusStrip>
        <div className="card-actions">
          <Button
            type="button"
            tone="secondary"
            onClick={async () => {
              const latest = await sendJson<SharedPrayerSession>(`/api/backend/prayer-sessions/${session.sessionCode}/join`, {
                method: "POST",
                body: JSON.stringify({})
              });
              setSession(latest);
            }}
          >
            Join or refresh
          </Button>
          <Button
            type="button"
            onClick={() => getSocket().emit("rep_complete", { sessionCode: session.sessionCode })}
          >
            Count repetition
          </Button>
          <Button
            type="button"
            tone="secondary"
            onClick={() =>
              getSocket().emit("start_session", {
                sessionCode: session.sessionCode,
                totalRepetitions: session.totalRepetitions || 21
              })
            }
          >
            Start session
          </Button>
          <Button
            type="button"
            tone="ghost"
            onClick={async () => {
              const latest = await sendJson<SharedPrayerSession>(`/api/backend/prayer-sessions/${session.sessionCode}/end`, {
                method: "POST",
                body: JSON.stringify({})
              });
              setSession(latest);
            }}
          >
            End session
          </Button>
        </div>
      </div>
      <div className="content-grid">
        <article className="surface-card">
          <h3>Participants</h3>
          <div className="list-stack">
            {session.participants.map((participant) => (
              <div key={`${participant.userId}-${participant.joinedAt}`} className="list-row">
                <span>{participant.name}</span>
                <span>{participant.isActive ? "Active" : "Away"}</span>
              </div>
            ))}
          </div>
        </article>
        <article className="surface-card">
          <h3>Live event log</h3>
          <div className="list-stack">
            {events.length ? events.map((event, index) => <div key={`${event}-${index}`} className="list-row">{event}</div>) : <p>Events will appear here as the session becomes active.</p>}
          </div>
        </article>
      </div>
    </div>
  );
}
