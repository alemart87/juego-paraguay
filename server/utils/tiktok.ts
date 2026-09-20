export function parseTikTokVideo(url: string) {
  const value =
    url
      .trim()
      .match(/https?:\/\/[^\s]+/)?.[0]
      ?.replace(/[),.;]+$/, "") ?? "";
  if (!value) return null;
  try {
    const parsed = new URL(value);
    const hostname = parsed.hostname.toLowerCase();
    if (hostname !== "tiktok.com" && !hostname.endsWith(".tiktok.com")) return null;
    const match =
      parsed.pathname.match(/\/video\/(\d{8,25})(?:\/|$)/) ??
      parsed.pathname.match(/\/player\/v1\/(\d{8,25})(?:\/|$)/) ??
      parsed.pathname.match(/\/v\/(\d{8,25})(?:\/|$)/) ??
      parsed.searchParams.get("item_id")?.match(/^(\d{8,25})$/);
    if (!match) return null;
    const videoId = match[1];
    return {
      url: parsed.toString(),
      videoId,
      embedUrl: `https://www.tiktok.com/player/v1/${videoId}?autoplay=1&loop=0&controls=0&progress_bar=0&play_button=0&volume_control=0&fullscreen_button=0&timestamp=0&music_info=0&description=0&rel=0&native_context_menu=0&closed_caption=0&muted=1`,
    };
  } catch {
    return null;
  }
}

export async function resolveTikTokVideo(url: string) {
  const direct = parseTikTokVideo(url);
  if (direct) return direct;
  const extracted =
    url
      .trim()
      .match(/https?:\/\/[^\s]+/)?.[0]
      ?.replace(/[),.;]+$/, "") ?? "";
  if (!extracted) return null;
  let candidate: URL;
  try {
    candidate = new URL(extracted);
  } catch {
    return null;
  }
  const host = candidate.hostname.toLowerCase();
  if (!["vm.tiktok.com", "vt.tiktok.com", "www.tiktok.com", "m.tiktok.com"].includes(host))
    return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);
  try {
    const response = await fetch(candidate, {
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "user-agent":
          "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148",
      },
    });
    return parseTikTokVideo(response.url);
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
