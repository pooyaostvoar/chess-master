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
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="currentColor"
      >
        <g transform="scale(0.85) translate(3 3)">
          <path
            d="M 11.10 27.05 C12.85,27.96 13.83,28.99 13.27,29.33 C11.62,30.35 5.65,25.76 3.72,21.98 C0.92,16.53 3.05,8.65 8.05,5.98 C9.17,5.37 12.43,4.49 15.30,4.02 C18.16,3.55 21.29,2.85 22.25,2.47 C23.65,1.92 24.00,2.32 24.00,4.41 C24.00,5.85 25.39,9.49 27.08,12.49 C30.34,18.26 30.53,20.64 27.86,22.32 C26.56,23.14 25.07,22.36 20.59,18.53 C17.49,15.88 15.18,13.49 15.45,13.22 C15.72,12.94 18.41,14.58 21.43,16.86 C24.45,19.14 27.16,21.00 27.46,21.00 C28.93,21.00 27.65,16.92 24.58,11.84 C22.70,8.72 21.37,5.96 21.63,5.70 C22.67,4.66 12.31,6.36 9.77,7.65 C6.72,9.19 4.00,13.70 4.01,17.20 C4.02,20.47 7.36,25.12 11.10,27.05 Z"
            fill="currentColor"
          />
        </g>
      </svg>
    );
  }

  if (type === "chesscom") {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 32 32"
      >
        <defs>
          <clipPath id="clip0">
            <rect width="22" height="32" />
          </clipPath>
        </defs>
        <g transform="translate(7, 0) scale(0.82)" clip-path="url(#clip0)">
          <path
            d="M18.7635 23.0905C13.3587 18.9895 13.9594 15.4295 13.8917 13.9663H17.1875C17.5725 13.2547 17.7692 12.5937 17.7692 11.7726L14.0335 9.3242C15.3323 8.38735 16.1785 6.86946 16.1785 5.15157C16.1785 2.98946 14.8394 1.13893 12.9419 0.374723C12.3433 0.132618 8.1104 13.9663 8.1104 13.9663C8.09559 14.2842 8.09136 14.6989 8.09136 15.1979C8.09136 16.5726 11.4844 16.3642 11.3046 17.5768C11.0339 19.3916 10.9767 20.7705 9.40713 25.1326C8.34732 28.0758 1.27982 25.1326 0.774246 26.5768C0.423092 27.5831 0.236938 28.7095 0.236938 29.9221C0.236938 30.0526 0.5204 32 11.0021 32C21.4839 32 21.7673 30.0526 21.7673 29.9221C21.7673 26.9642 20.6567 24.5242 18.7656 23.0905H18.7635Z"
            fill="currentColor"
          />
          <path
            d="M10.8097 24.9305C11.3935 22.2926 11.9097 19.48 12.2227 17.7937C12.6141 15.6905 9.40928 15.3158 8.09139 15.1221C8.03216 16.9179 7.5287 19.8316 3.23447 23.0884C2.07736 23.9663 1.21428 25.221 0.717163 26.741C1.87639 27.3032 3.42274 27.6379 5.80678 27.6379C7.3362 27.6379 10.1687 27.821 10.8075 24.9284L10.8097 24.9305Z"
            fill="currentColor"
          />
          <path
            d="M13.0604 13.9663C13.5681 12.6547 13.5025 11.7726 13.5025 11.7726L11.3871 9.32421C13.6379 8.36842 14.9918 6.57053 14.9918 4.48C14.9918 2.80842 14.1921 1.32421 12.9525 0.383158C12.3496 0.138948 11.6896 0.00210571 11 0.00210571C8.14214 0.00210571 5.82368 2.30737 5.82368 5.15368C5.82368 6.87158 6.66983 8.38947 7.96868 9.32632L4.23291 11.7747C4.23291 12.5958 4.42753 13.2568 4.81464 13.9684H13.0625L13.0604 13.9663Z"
            fill="currentColor"
          />
          <path
            d="M10.7038 1.05052C13.6886 1.51157 9.32879 4.95789 7.95591 4.79578C6.64648 4.63999 7.90725 0.61894 10.7038 1.05052Z"
            fill="currentColor"
          />
        </g>
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
