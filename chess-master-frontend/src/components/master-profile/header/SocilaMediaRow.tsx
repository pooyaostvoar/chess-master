import { BaseUser } from "@chess-master/schemas";

interface SocialMediaRow {
  user: BaseUser;
}
const SocialIcon = ({ type }: { type: string }) => {
  if (type === "instagram") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-4 w-4"
      >
        <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.3" cy="6.7" r="1" fill="currentColor" stroke="none" />
      </svg>
    );
  }

  if (type === "youtube") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-4 w-4"
      >
        <path d="M21 12c0 3.2-.3 5.2-.8 6.1-.4.7-1 1.2-1.7 1.4C17.4 20 14.9 20 12 20s-5.4 0-6.5-.5c-.7-.2-1.3-.7-1.7-1.4C3.3 17.2 3 15.2 3 12s.3-5.2.8-6.1c.4-.7 1-1.2 1.7-1.4C6.6 4 9.1 4 12 4s5.4 0 6.5.5c.7.2 1.3.7 1.7 1.4.5.9.8 2.9.8 6.1Z" />
        <path d="m10 15.5 5-3.5-5-3.5v7Z" fill="currentColor" stroke="none" />
      </svg>
    );
  }

  if (type === "twitch") {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M4 3h16v11l-4 4h-4l-2 2H7v-2H4V3Zm2 2v11h3v2l2-2h5l2-2V5H6Zm4 2h2v5h-2V7Zm5 0h2v5h-2V7Z" />
      </svg>
    );
  }

  if (type === "facebook") {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M13.5 21v-8h2.7l.4-3h-3.1V8.1c0-.9.3-1.6 1.7-1.6h1.5V3.8c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4V10H8v3h2.5v8h3Z" />
      </svg>
    );
  }

  if (type === "tiktok") {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M14 3c.2 1.7 1.2 3.1 2.8 3.9.9.4 1.8.6 2.7.6v2.8c-1.5 0-2.9-.4-4.2-1.1v5.5a5.7 5.7 0 1 1-5.7-5.7c.3 0 .7 0 1 .1v2.9a2.8 2.8 0 1 0 1.9 2.7V3H14Z" />
      </svg>
    );
  }

  if (type === "lichess") {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M12 2 8.5 8.2l1.2 7.2L12 22l2.3-6.6 1.2-7.2L12 2Zm0 5.3 1 1.8-.6 3.6H11.6L11 9.1l1-1.8Z" />
      </svg>
    );
  }

  if (type === "chesscom") {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M7.5 5.5a2.5 2.5 0 1 1 4.9.7h2.8A2.8 2.8 0 1 1 18 9.9v1.2c-1.6.2-2.9 1.5-3.1 3H9.5v2h5.4a3.5 3.5 0 1 0 5.1-4.3V9.2a2.8 2.8 0 0 0-1.8-5.2 2.8 2.8 0 0 0-2.5 1.5h-3.1A2.5 2.5 0 0 0 7.5 5.5Z" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-4 w-4"
    >
      <path
        d="M4 4l6.5 8.4L4.4 20H7l4.7-5.7L16 20h4L13 11.2 19 4h-2.6l-4.2 5.2L8 4H4Z"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  );
};
export const SocialMediaRow: React.FC<SocialMediaRow> = ({
  user,
}: {
  user: BaseUser;
}) => {
  const platformLinks = [
    { label: "Lichess", href: user.lichessUrl, type: "lichess" },
    { label: "Chess.com", href: user.chesscomUrl, type: "chesscom" },
  ].filter((item) => !!item.href);
  const socialLinks = [
    { label: "Instagram", href: user.instagramUrl, type: "instagram" },
    { label: "YouTube", href: user.youtubeUrl, type: "youtube" },
    { label: "X", href: user.xUrl, type: "x" },
    { label: "Twitch", href: user.twitchUrl, type: "twitch" },
    { label: "Facebook", href: user.facebookUrl, type: "facebook" },
    { label: "TikTok", href: user.tiktokUrl, type: "tiktok" },
  ].filter((item) => !!item.href);
  const items = [...platformLinks, ...socialLinks];

  return (
    <div className="flex flex-wrap items-center gap-2">
      {items.map((item) => (
        <a
          key={item.label}
          href={item.href ?? ""}
          aria-label={item.label}
          className={`flex h-8 w-8 items-center justify-center rounded-full transition ${"bg-white/15 text-white backdrop-blur hover:bg-white/25"}`}
        >
          <SocialIcon type={item.type} />
        </a>
      ))}
    </div>
  );
};
