import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { sharedPrayerApi } from "@/lib/api";
import { getSharedPrayerSocket } from "@/lib/shared-prayer";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/Button";
import { HeroSection, SectionCard, StatusStrip } from "@/components/ui/Surface";

export default function SharedPrayerPage() {
  const { sessionCode = "" } = useParams();
  const { user } = useAuth();
  const [events, setEvents] = useState<string[]>([]);
  const session = useQuery({
    queryKey: ["shared-prayer-session", sessionCode],
    queryFn: () => sharedPrayerApi.detail(sessionCode),
    enabled: Boolean(sessionCode)
  });
  const joinMutation = useMutation({
    mutationFn: () => sharedPrayerApi.join(sessionCode),
    onSuccess: () => session.refetch()
  });
  const endMutation = useMutation({
    mutationFn: () => sharedPrayerApi.end(sessionCode),
    onSuccess: () => session.refetch()
  });

  useEffect(() => {
    if (!sessionCode || !user) return;
    const socket = getSharedPrayerSocket();
    socket.emit("join_session", { sessionCode, userId: user.id, name: user.name });

    const append = (message: string) => setEvents((prev) => [message, ...prev].slice(0, 6));
    socket.on("participant_joined", (payload) => append(`${payload.name} joined the session.`));
    socket.on("participant_left", (payload) => append(`${payload.name} left the session.`));
    socket.on("rep_counted", (payload) => append(`Shared repetition ${payload.completedReps} of ${payload.totalReps}.`));
    socket.on("session_started", () => append("Session started."));
    socket.on("session_ended", () => append("Session completed."));

    return () => {
      socket.off("participant_joined");
      socket.off("participant_left");
      socket.off("rep_counted");
      socket.off("session_started");
      socket.off("session_ended");
    };
  }, [sessionCode, user]);

  if (!session.data) {
    return <div className="page-state">Loading shared prayer...</div>;
  }

  return (
    <div className="page-stack">
      <HeroSection eyebrow="Shared prayer" title={session.data.sessionCode} subtitle={`Status: ${session.data.status}`} />

      <SectionCard title="Participants">
        <div className="content-grid">
          {session.data.participants.map((participant) => (
            <article key={`${participant.userId}-${participant.joinedAt}`} className="content-card">
              <h3>{participant.name}</h3>
              <p>{participant.isActive ? "Active in session" : "Not active right now"}</p>
            </article>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Session controls">
        <div className="inline-actions">
          <Button tone="secondary" onClick={() => joinMutation.mutate()}>
            Join / refresh
          </Button>
          <Button
            onClick={() => {
              const socket = getSharedPrayerSocket();
              socket.emit("rep_complete", { sessionCode });
            }}
          >
            Count repetition
          </Button>
          <Button
            tone="secondary"
            onClick={() => {
              const socket = getSharedPrayerSocket();
              socket.emit("start_session", { sessionCode, totalRepetitions: session.data.totalRepetitions || 21 });
            }}
          >
            Start session
          </Button>
          <Button tone="ghost" onClick={() => endMutation.mutate()}>
            End session
          </Button>
        </div>
        <StatusStrip tone="success">
          Completed repetitions: {session.data.currentRepetition || 0}/{session.data.totalRepetitions || 0}
        </StatusStrip>
      </SectionCard>

      <SectionCard title="Live event log">
        <div className="list-stack">
          {events.map((event, index) => (
            <div key={`${event}-${index}`} className="event-row">
              {event}
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
