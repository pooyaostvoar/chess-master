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
      className="flex items-center gap-4 mb-4 hover:opacity-90 transition"
    >
      {user.profilePicture ? (
        <img
          src={user.profilePicture}
          alt={user.username}
          className="w-16 h-16 rounded-full object-cover border-2 border-primary"
        />
      ) : (
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white text-2xl font-bold">
          {user.username.charAt(0).toUpperCase()}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <CardTitle className="text-xl truncate" title={user.username}>
          {user.username}
        </CardTitle>
        {user.title && (
          <Badge variant="default" className="mt-1">
            {user.title}
          </Badge>
        )}
      </div>
    </Link>
  );
};
