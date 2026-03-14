"use client";

import { useEffect, useMemo, useState } from "react";
import { trackEvent } from "../../lib/analytics";
import type { PujaBooking, UserSession } from "../../lib/types";
import { Button } from "../ui/Button";
import { InlineDismissLink, useUx } from "./UxProvider";

type SessionSummary = NonNullable<UserSession["sharedSessions"]>[number];

type SpotlightKey = "shared_prayer" | "gift_puja" | "learning_path" | "sacred_video";

const spotlightOrder: SpotlightKey[] = ["shared_prayer", "gift_puja", "learning_path", "sacred_video"];

export function HomeDiscovery({
  bookings,
  giftSent,
  giftReceived,
  sharedSessions
}: {
  bookings: PujaBooking[];
  giftSent: PujaBooking[];
  giftReceived: PujaBooking[];
  sharedSessions: SessionSummary[];
}) {
  const { state, showSetupCompleteBanner, dismissPrompt } = useUx();
  const [timestampAnchor] = useState(() => Date.now());

  const latestBooking = bookings[0] || null;
  const latestGift = giftSent[0] || giftReceived[0] || null;
  const latestSession = sharedSessions[0] || null;
  const videoReadyBooking = bookings.find((booking) => booking.status === "video_ready") || null;

  const spotlight = useMemo(() => {
    const weekIndex = Math.floor(timestampAnchor / (7 * 24 * 60 * 60 * 1000)) % spotlightOrder.length;
    const ordered = spotlightOrder.slice(weekIndex).concat(spotlightOrder.slice(0, weekIndex));
    const usedMap: Record<SpotlightKey, boolean> = {
      shared_prayer: Boolean(state.sharedPrayerCreatedAt),
      gift_puja: Boolean(state.giftCompletedAt),
      learning_path: Boolean(state.learningPathOpenedAt),
      sacred_video: Boolean(state.videoWatchedAt)
    };
    return ordered.find((feature) => !usedMap[feature]) || ordered[0];
  }, [state.giftCompletedAt, state.learningPathOpenedAt, state.sharedPrayerCreatedAt, state.videoWatchedAt, timestampAnchor]);

  useEffect(() => {
    trackEvent("feature_spotlight_viewed", { feature: spotlight });
  }, [spotlight]);

  return (
    <div className="page-stack">
      {showSetupCompleteBanner ? (
        <div className="discovery-banner discovery-banner--gold">
          <button
            type="button"
            className="discovery-banner__dismiss"
            onClick={() => dismissPrompt("onboardingCompletedBannerDismissedAt")}
            aria-label="Dismiss setup banner"
          >
            x
          </button>
          <strong>You are set up. Here is what to explore next:</strong>
          <div className="discovery-banner__list">
            <InlineDismissLink href="/pujas">Book a puja at the temple {"->"}</InlineDismissLink>
            <InlineDismissLink href="/sessions/create">Start a family prayer session {"->"}</InlineDismissLink>
            <InlineDismissLink href="/prayers#learning-paths">Learn about a deity {"->"}</InlineDismissLink>
          </div>
        </div>
      ) : null}

      {state.onboardingStartedAt && !state.firstHomeSharedIntroDismissedAt && !state.sharedPrayerCreatedAt ? (
        <div className="discovery-hero discovery-hero--dark">
          <button
            type="button"
            className="discovery-banner__dismiss discovery-banner__dismiss--light"
            onClick={() => dismissPrompt("firstHomeSharedIntroDismissedAt")}
            aria-label="Dismiss shared prayer introduction"
          >
            x
          </button>
          <span className="discovery-hero__om">{"\u0950"}</span>
          <p className="eyebrow">Pray together</p>
          <h3>Pray with your family, in real time.</h3>
          <p>
            Create a session, share a code, and count repetitions together. Works across
            timezones, from Kerala to Toronto.
          </p>
          <div className="card-actions">
            <Button
              href="/sessions/create"
              onClick={() => {
                trackEvent("feature_spotlight_clicked", { feature: "shared_prayer", source: "home_intro" });
              }}
            >
              Start a shared session
            </Button>
            <Button tone="secondary" href="/sessions/create">
              Learn more
            </Button>
          </div>
        </div>
      ) : null}

      {videoReadyBooking && !state.videoWatchedAt ? (
        <div className="discovery-hero discovery-hero--dark discovery-hero--video">
          <p className="eyebrow">Your puja recording</p>
          <h3>Your {videoReadyBooking.puja?.name.en || "temple"} recording is ready.</h3>
          <p>
            The Tantri completed your puja on this booking. Your private HD recording is
            waiting in bookings.
          </p>
          <div className="card-actions">
            <Button
              href={`/bookings/${videoReadyBooking._id}/video`}
              onClick={() => {
                trackEvent("feature_spotlight_clicked", { feature: "sacred_video", source: "home_video_ready" });
              }}
            >
              Watch your puja {"->"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="spotlight-card">
          <p className="eyebrow">Discover</p>
          {spotlight === "shared_prayer" ? (
            <>
              <h3>Invite your family into one prayer session.</h3>
              <p>
                Create a room, share the session code, and count repetitions together in
                real time wherever your family is in the world.
              </p>
              <div className="card-actions">
                <Button
                  href="/sessions/create"
                  onClick={() => trackEvent("feature_spotlight_clicked", { feature: spotlight })}
                >
                  Create a prayer room {"->"}
                </Button>
                <Button tone="ghost" href="/sessions/create">
                  Learn more
                </Button>
              </div>
            </>
          ) : null}
          {spotlight === "gift_puja" ? (
            <>
              <h3>{"Offer a puja in someone else\u2019s name."}</h3>
              <p>
                Book Abhishekam or Sahasranama Archana as a gift for your parents, children,
                or friends. The Tantri performs in their name.
              </p>
              <div className="card-actions">
                <Button
                  href="/pujas"
                  onClick={() => trackEvent("feature_spotlight_clicked", { feature: spotlight })}
                >
                  Browse pujas to gift {"->"}
                </Button>
                <Button tone="ghost" href="/pujas">
                  Learn more
                </Button>
              </div>
            </>
          ) : null}
          {spotlight === "learning_path" ? (
            <>
              <h3>A guided path through Ganesha, Devi, and Shiva.</h3>
              <p>
                Structured modules pair stories, symbolism, and rituals for diaspora families
                who want their children to understand the tradition.
              </p>
              <div className="card-actions">
                <Button
                  href="/prayers#learning-paths"
                  onClick={() => trackEvent("feature_spotlight_clicked", { feature: spotlight })}
                >
                  Open learning paths {"->"}
                </Button>
                <Button tone="ghost" href="/prayers#learning-paths">
                  Learn more
                </Button>
              </div>
            </>
          ) : null}
          {spotlight === "sacred_video" ? (
            <>
              <h3>Every puja is recorded and delivered privately.</h3>
              <p>
                Within 48 hours of the ritual, a full HD recording appears in your bookings,
                visible only to your account.
              </p>
              <div className="card-actions">
                <Button
                  href={latestBooking ? "/bookings" : "/pujas"}
                  onClick={() => trackEvent("feature_spotlight_clicked", { feature: spotlight })}
                >
                  {latestBooking ? "View your bookings ->" : "Book your first puja ->"}
                </Button>
                <Button tone="ghost" href="/bookings">
                  Learn more
                </Button>
              </div>
            </>
          ) : null}
        </div>
      )}

      <section className="section-card">
        <div className="section-card__header">
          <p className="eyebrow">Family</p>
          <h2>{"Your family\u2019s sacred activity"}</h2>
        </div>
        <div className="content-grid">
          <article className="surface-card family-panel">
            <h3>Shared prayer sessions</h3>
            {latestSession ? (
              <>
                <p>{latestSession.prayerName}</p>
                <div className="list-stack">
                  <div className="list-row">
                    <span>Session</span>
                    <span>{latestSession.sessionId}</span>
                  </div>
                  <div className="list-row">
                    <span>Participants</span>
                    <span>{latestSession.participantNames.join(", ")}</span>
                  </div>
                </div>
                <div className="card-actions">
                  <Button href="/sessions/create">Create another session</Button>
                </div>
              </>
            ) : (
              <div className="empty-invitation">
                <p>No shared sessions yet. Create one and invite your family.</p>
                <Button tone="secondary" href="/sessions/create">
                  Create prayer room {"->"}
                </Button>
              </div>
            )}
          </article>

          <article className="surface-card family-panel">
            <h3>Gifts</h3>
            {latestGift ? (
              <>
                <p>{latestGift.puja?.name.en || "Temple gift"}</p>
                <div className="list-stack">
                  <div className="list-row">
                    <span>Direction</span>
                    <span>{giftSent[0]?._id === latestGift._id ? "Sent to family" : "Received"}</span>
                  </div>
                  <div className="list-row">
                    <span>Status</span>
                    <span>{latestGift.status}</span>
                  </div>
                </div>
                <div className="card-actions">
                  <Button tone="secondary" href="/bookings">
                    Open gift record
                  </Button>
                </div>
              </>
            ) : (
              <div className="empty-invitation">
                <p>Gift a puja to your family in Kerala or abroad.</p>
                <span className="muted">They will receive the sacred video recording.</span>
                <Button tone="secondary" href="/pujas">
                  Browse pujas to gift {"->"}
                </Button>
              </div>
            )}
          </article>
        </div>
      </section>
    </div>
  );
}
