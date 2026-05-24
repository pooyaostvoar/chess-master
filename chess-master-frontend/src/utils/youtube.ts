export function getYoutubeVideoId(input: string): string | null {
  const value = input.trim();
  if (!value) return null;

  if (/^[a-zA-Z0-9_-]{11}$/.test(value)) {
    return value;
  }

  try {
    const url = new URL(value.includes("://") ? value : `https://${value}`);
    const host = url.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      const id = url.pathname.slice(1).split("/")[0];
      return id || null;
    }

    if (host === "youtube.com" || host === "m.youtube.com") {
      if (url.pathname === "/watch") {
        return url.searchParams.get("v");
      }

      const embedMatch = url.pathname.match(/^\/embed\/([^/?]+)/);
      if (embedMatch) return embedMatch[1];

      const shortsMatch = url.pathname.match(/^\/shorts\/([^/?]+)/);
      if (shortsMatch) return shortsMatch[1];
    }
  } catch {
    return null;
  }

  return null;
}

export function getYoutubeEmbedUrl(input: string): string | null {
  const videoId = getYoutubeVideoId(input);
  return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
}
