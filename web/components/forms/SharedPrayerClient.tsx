"use client";

import { useEffect, useMemo, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { BACKEND_ORIGIN } from "../../lib/env";
import { SITE_URL } from "../../lib/env";
import { sendJson } from "../../lib/client-api";
import { getSharedPrayerProgress } from "../../lib/presentation";
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
  user,
  expectedOthers = 0
}: {
  initialSession: SharedPrayerSession;
  user: UserSession;
  expectedOthers?: number;
}) {
  const [session, setSession] = useState(initialSession);
  const [events, setEvents] = useState<string[]>([]);
  const [pulse, setPulse] = useState(false);
  const [copied, setCopied] = useState(false);
  const [yourCount, setYourCount] = useState(0);
  const [shareStatus, setShareStatus] = useState("");

  const prayerTitle = useMemo(() => {
    return typeof session.prayerId === "string" ? "Shared prayer session" : session.prayerId.title.en;
  }, [session.prayerId]);
  const isHost = session.hostUserId === user.id;

  useEffect(() => {
    const activeSocket = getSocket();
    activeSocket.emit("join_session", { sessionCode: session.sessionCode, userId: user.id, name: user.name });
    const pushEvent = (value: string) => setEvents((current) => [value, ...current].slice(0, 6));

    activeSocket.on("participant_joined", (payload) => {
      pushEvent(`${payload.name} joined the room.`);
      setSession((current) => {
        const existing = current.participants.find((participant) => participant.userId === payload.userId);
        if (existing) {
          return {
            ...current,
            participants: current.participants.map((participant) =>
              participant.userId === payload.userId
                ? { ...participant, isActive: true, leftAt: undefined }
                : participant
            )
          };
        }

        return {
          ...current,
          participants: [
            ...current.participants,
            {
              userId: payload.userId,
              name: payload.name,
              joinedAt: new Date().toISOString(),
              isActive: true
            }
          ]
        };
      });
    });
    activeSocket.on("participant_left", (payload) => {
      pushEvent(`${payload.name} left the room.`);
      setSession((current) => ({
        ...current,
        participants: current.participants.map((participant) =>
          participant.userId === payload.userId ? { ...participant, isActive: false } : participant
        )
      }));
    });
    activeSocket.on("rep_counted", (payload) => {
      pushEvent(`Repetition ${payload.completedReps} of ${payload.totalReps}.`);
      setSession((current) => ({
        ...current,
        currentRepetition: payload.completedReps,
        totalRepetitions: payload.totalReps,
        status: payload.completedReps >= payload.totalReps ? "completed" : current.status
      }));
      setPulse(true);
    });
    activeSocket.on("session_started", (payload) => {
      pushEvent("Session started.");
      setSession((current) => ({
        ...current,
        status: "active",
        totalRepetitions: payload?.totalReps || current.totalRepetitions
      }));
    });
    activeSocket.on("session_ended", () => {
      pushEvent("Session completed.");
      setSession((current) => ({ ...current, status: "completed" }));
    });

    return () => {
      activeSocket.off("participant_joined");
      activeSocket.off("participant_left");
      activeSocket.off("rep_counted");
      activeSocket.off("session_started");
      activeSocket.off("session_ended");
    };
  }, [session.sessionCode, user.id, user.name]);

  useEffect(() => {
    if (!pulse) return undefined;
    const timer = window.setTimeout(() => setPulse(false), 320);
    return () => window.clearTimeout(timer);
  }, [pulse]);

  const currentRepetition = session.currentRepetition || 0;
  const totalRepetitions = session.totalRepetitions || 0;
  const progress = getSharedPrayerProgress(currentRepetition, totalRepetitions);
  const isWaiting = session.status === "waiting";
  const activeParticipants = session.participants.filter((participant) => participant.isActive);
  const waitingFor = Math.max(0, expectedOthers + 1 - activeParticipants.length);
  const shareUrl = `${SITE_URL}/sessions/${session.sessionCode}`;
  const shareMessage = `Join my prayer session: ${session.sessionCode} -> ${shareUrl}`;
  const isCompleted = session.status === "completed" || (totalRepetitions > 0 && currentRepetition >= totalRepetitions);

  async function shareMilestone() {
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 1200;
    const context = canvas.getContext("2d");
    if (!context) return;

    context.fillStyle = "#F5F0E8";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#C1440E";
    context.font = "700 66px Georgia";
    context.fillText("Prarthana", 80, 120);
    context.font = "48px Georgia";
    context.fillText(prayerTitle, 80, 240);
    context.font = "700 220px Georgia";
    context.fillText(`${currentRepetition}`, 80, 520);
    context.font = "60px Georgia";
    context.fillStyle = "#6D655A";
    context.fillText(`of ${totalRepetitions} repetitions`, 80, 600);
    context.fillText(`Session ${session.sessionCode}`, 80, 720);
    context.fillText("Your family completed this count together.", 80, 820);

    const dataUrl = canvas.toDataURL("image/png");

    if (navigator.share) {
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const file = new File([blob], `divya-session-${session.sessionCode}.png`, { type: "image/png" });
      await navigator.share({
        files: [file],
        title: `${prayerTitle} milestone`,
        text: `Our family completed ${currentRepetition} repetitions together.`
      });
      setShareStatus("Milestone shared.");
      return;
    }

    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `divya-session-${session.sessionCode}.png`;
    link.click();
    setShareStatus("Milestone image downloaded.");
  }

  return (
    <div className="page-stack">
      <div className="shared-prayer-room">
        <div className="shared-prayer-room__counter">
          {isWaiting ? (
            <div className="shared-prayer-room__waiting">
              <div className="shared-prayer-room__om">{"\u0950"}</div>
              <h3>Waiting for your family.</h3>
              <p>Share this code with the people joining you:</p>
              <div className="session-code-panel__code">{session.sessionCode}</div>
              <p className="muted">
                {waitingFor > 0
                  ? `Waiting for ${waitingFor} more participants before you begin.`
                  : "The session will begin when everyone has joined."}
              </p>
              <div className="card-actions shared-prayer-room__actions">
                <Button
                  type="button"
                  tone="secondary"
                  onClick={async () => {
                    await navigator.clipboard.writeText(session.sessionCode);
                    setCopied(true);
                    setEvents((current) => ["Session code copied.", ...current].slice(0, 6));
                    window.setTimeout(() => setCopied(false), 1500);
                  }}
                >
                  Copy code
                </Button>
                {copied ? <span className="session-code-panel__tooltip">Copied!</span> : null}
                <Button tone="secondary" href={`https://wa.me/?text=${encodeURIComponent(shareMessage)}`}>
                  Share via WhatsApp
                </Button>
                {isHost ? (
                  <Button
                    type="button"
                    onClick={() =>
                      getSocket().emit("start_session", {
                        sessionCode: session.sessionCode,
                        totalRepetitions: session.totalRepetitions || 21
                      })
                    }
                  >
                    {waitingFor > 0 ? "Start anyway" : "Start session"}
                  </Button>
                ) : null}
              </div>
            </div>
          ) : (
            <>
              {isCompleted ? (
                <div className="shared-prayer-room__completion" aria-live="polite">
                  <div className="shared-prayer-room__completion-ripple" aria-hidden="true" />
                  <p className="eyebrow">Session complete</p>
                  <h3>Your family has completed {totalRepetitions} repetitions together.</h3>
                  <p className="muted">Carry this completed count back into your home practice or share it with family.</p>
                  <div className="card-actions">
                    <Button type="button" onClick={() => void shareMilestone()}>
                      Share this milestone
                    </Button>
                    <Button tone="secondary" href="/home">
                      Return to home
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="shared-prayer-room__stage">
                    <p className="eyebrow">
                      Session {session.sessionCode} · {prayerTitle}
                    </p>
                    <div
                      className={`shared-prayer-room__dial shared-prayer-room__dial--active ${pulse ? "shared-prayer-room__dial--pulse" : ""}`}
                    >
                      <svg className="shared-prayer-room__progress" viewBox="0 0 220 220" aria-hidden="true">
                        <circle cx="110" cy="110" r="96" className="shared-prayer-room__progress-track" />
                        <circle
                          cx="110"
                          cy="110"
                          r="96"
                          className="shared-prayer-room__progress-value"
                          style={{
                            ["--progress" as string]: `${progress}`
                          }}
                        />
                      </svg>
                      <div className="shared-prayer-room__counter-copy">
                        <div className="shared-prayer-room__countline">
                          <span className="shared-prayer-room__count-current">{currentRepetition}</span>
                          <span className="shared-prayer-room__count-separator">/</span>
                          <span className="shared-prayer-room__count-total">{totalRepetitions}</span>
                        </div>
                        <strong>{progress}% complete</strong>
                      </div>
                    </div>
                  </div>
                  <div className="participant-chip-row participant-chip-row--centered">
                    {activeParticipants.map((participant) => (
                      <div key={`${participant.userId}-${participant.joinedAt}`} className="participant-chip">
                        <span className={`participant-chip__dot ${participant.isActive ? "participant-chip__dot--active" : ""}`} />
                        <span className="participant-chip__avatar" aria-hidden="true">
                          {participant.name.trim().slice(0, 1).toUpperCase()}
                        </span>
                        <span>{participant.name}</span>
                      </div>
                    ))}
                  </div>
                  <div className="surface-card shared-prayer-room__summary">
                    <p>
                      Combined family count: <strong>{currentRepetition}</strong>
                    </p>
                    <p>
                      My count: <strong>{yourCount}</strong>
                    </p>
                  </div>
                  <div className="card-actions shared-prayer-room__actions shared-prayer-room__actions--sticky">
                    <Button
                      type="button"
                      block
                      onClick={() => {
                        navigator.vibrate?.(50);
                        setYourCount((current) => current + 1);
                        getSocket().emit("rep_complete", { sessionCode: session.sessionCode });
                      }}
                    >
                      +1 repetition
                    </Button>
                  </div>
                  <div className="card-actions shared-prayer-room__actions">
                    {isHost ? (
                      <Button
                        type="button"
                        tone="ghost"
                        onClick={async () => {
                          const latest = await sendJson<SharedPrayerSession>(
                            `/api/backend/prayer-sessions/${session.sessionCode}/end`,
                            {
                              method: "POST",
                              body: JSON.stringify({})
                            }
                          );
                          setSession(latest);
                        }}
                      >
                        End session
                      </Button>
                    ) : null}
                    <Button type="button" tone="secondary" onClick={() => void shareMilestone()}>
                      Share count as image
                    </Button>
                  </div>
                </>
              )}
            </>
          )}
        </div>

        <div className="shared-prayer-room__support">
          <StatusStrip tone="neutral">
            {prayerTitle} - Session {session.sessionCode} - {session.status}
          </StatusStrip>
          <div className="shared-prayer-room__log">
            {events.length ? (
              events.map((event, index) => (
                <div key={`${event}-${index}`} className="shared-prayer-room__toast">
                  {event}
                </div>
              ))
            ) : (
              <p className="muted">The room is ready. Share the code with your family and begin when everyone arrives.</p>
            )}
          </div>
          {shareStatus ? <StatusStrip tone="success">{shareStatus}</StatusStrip> : null}
          <div className="card-actions">
            <Button
              type="button"
              tone="secondary"
              onClick={async () => {
                const latest = await sendJson<SharedPrayerSession>(
                  `/api/backend/prayer-sessions/${session.sessionCode}/join`,
                  {
                    method: "POST",
                    body: JSON.stringify({})
                  }
                );
                setSession(latest);
              }}
            >
              Check for new participants
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
