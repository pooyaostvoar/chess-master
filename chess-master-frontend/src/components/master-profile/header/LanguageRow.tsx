import { BaseUser } from "@chess-master/schemas";

export const LanguageRow: React.FC<{ user: BaseUser }> = ({ user }) => (
  <div className="flex flex-wrap items-center gap-2">
    {(user.languages || []).map((lang: string) => (
      <span
        key={lang}
        className="rounded-full px-2.5 py-1 text-xs font-medium bg-white/15 text-white backdrop-blur"
      >
        {lang}
      </span>
    ))}
  </div>
);
