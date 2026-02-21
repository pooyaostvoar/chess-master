import React from "react";
import { Link } from "react-router-dom";
import { CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import type { User } from "../../services/auth";

interface MasterCardProps {
  user: User;
}

export const AccountHeader: React.FC<MasterCardProps> = ({ user }) => {
  return (
    <Link
      to={`/users/${user.id}`}
      className="flex items-center gap-4 mb-3 hover:opacity-90 transition"
    >
      {/* Avatar */}
      {user.profilePicture ? (
        <img
          src={user.profilePicture}
          alt={user.username}
          className="w-14 h-14 rounded-full object-cover border-2 border-blue-500"
        />
      ) : (
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xl font-bold">
          {user.username.charAt(0).toUpperCase()}
        </div>
      )}

      {/* User Info */}
      <div className="flex-1 min-w-0">
        <CardTitle
          className="text-lg font-semibold truncate"
          title={user.username}
        >
          {user.username}
        </CardTitle>

        {/* Title */}
        {user.title && (
          <Badge className="mt-1 mr-2 bg-blue-600 hover:bg-blue-700">
            {user.title}
          </Badge>
        )}

        {/* Languages */}
        {user.languages && user.languages.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {user.languages.map((lang) => (
              <Badge key={lang} variant="secondary" className="text-xs">
                {lang}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
};
