import { BaseUser } from "@chess-master/schemas";

export const LanguageRow: React.FC<{ user: BaseUser }> = ({ user }) => (
  <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap scrollbar-hide">
    {(user.languages || []).map((lang: string) => (
      <span
        key={lang}
        className="flex-shrink-0 rounded-full px-2.5 py-1 text-xs font-medium bg-white/15 text-white backdrop-blur"
      >
        {lang}
      </span>
    ))}
  </div>
);
