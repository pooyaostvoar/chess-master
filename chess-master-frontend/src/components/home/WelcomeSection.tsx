import React from "react";
import type { User } from "../../services/auth";

interface WelcomeSectionProps {
  user: User;
}

export const WelcomeSection: React.FC<WelcomeSectionProps> = ({ user }) => {
  return (
    <div className="mb-12">
      <h1 className="text-4xl md:text-5xl font-bold mb-4">
        Welcome back, {user.username}!!
      </h1>
      <p className="text-lg text-muted-foreground">
        {user.isMaster
          ? "Manage your schedule and connect with students"
          : "Continue your chess journey with expert guidance"}
      </p>
    </div>
  );
};
