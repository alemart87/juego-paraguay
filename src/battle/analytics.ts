import type { EpisodeId, FighterId } from "./content";
type AnalyticsEvent = "page_view" | "game_start" | "game_win" | "game_loss" | "premium_trial";
const KEY = "ib-analytics-session-v1";
export function sessionId() {
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(KEY, id);
  }
  return id;
}
export function trackGame(event: AnalyticsEvent, level?: EpisodeId, hero?: FighterId) {
  if (typeof window === "undefined") return;
  void fetch("/api/analytics", {
    method: "POST",
    headers: { "content-type": "application/json" },
    keepalive: true,
    body: JSON.stringify({ sessionId: sessionId(), event, level, hero }),
  }).catch(() => undefined);
}
