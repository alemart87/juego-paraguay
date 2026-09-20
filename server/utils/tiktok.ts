export function parseTikTokVideo(url: string) {
  const value = url.trim();
  if (!value) return null;
  try {
    const parsed = new URL(value);
    const hostname = parsed.hostname.toLowerCase();
    if (hostname !== "tiktok.com" && !hostname.endsWith(".tiktok.com")) return null;
    const match = parsed.pathname.match(/\/video\/(\d{8,25})(?:\/|$)/);
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
