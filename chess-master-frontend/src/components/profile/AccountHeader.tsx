import React from "react";
import { Link } from "react-router-dom";
import { CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { ShieldCheck } from "lucide-react";
import type { User } from "../../services/auth";

interface AccountHeaderProps {
  user: User;
  /** Max languages to show (e.g. 2 for compact cards). Omit to show all. */
  maxLanguages?: number;
  /** Show subtle verified cue near title (for listing cards) */
  showVerified?: boolean;
}

export const AccountHeader: React.FC<AccountHeaderProps> = ({
  user,
  maxLanguages,
  showVerified,
}) => {
  const max = maxLanguages ?? user.languages?.length ?? 0;
  const languages = user.languages?.slice(0, max) ?? [];
  const extraCount = (user.languages?.length ?? 0) - languages.length;

  return (
    <Link
      to={`/users/${user.id}`}
      className="flex items-center gap-4 hover:opacity-90 transition"
    >
      {/* Avatar */}
      {user.profilePicture ? (
        <img
          src={user.profilePicture}
          alt={user.username}
          className="w-14 h-14 rounded-full object-cover border-2 border-primary"
        />
      ) : (
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground text-xl font-bold">
          {user.username.charAt(0).toUpperCase()}
        </div>
      )}

      {/* User Info */}
      <div className="flex-1 min-w-0">
        <CardTitle
          className="text-lg font-semibold line-clamp-1"
          title={user.username}
        >
          {user.username}
        </CardTitle>

        {/* Title + optional verified */}
        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
          {user.title && (
            <Badge className="bg-primary hover:bg-primary/90">
              {user.title}
            </Badge>
          )}
          {showVerified && (
            <span className="text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5" />
            </span>
          )}
        </div>

        {/* Languages (max N, +extra) */}
        {languages.length > 0 && (
          <div className="flex flex-wrap items-center gap-1 mt-1">
            {languages.map((lang) => (
              <Badge key={lang} variant="secondary" className="text-xs">
                {lang}
              </Badge>
            ))}
            {extraCount > 0 && (
              <span className="text-xs text-muted-foreground">+{extraCount}</span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
};
