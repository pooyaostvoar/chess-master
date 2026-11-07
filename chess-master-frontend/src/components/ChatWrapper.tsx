import React from "react";
import { useUser } from "../contexts/UserContext";
import UnreadSendersList from "./UnreadSendersList";

interface ChatWrapperProps {
  children: React.ReactNode;
}

const ChatWrapper: React.FC<ChatWrapperProps> = ({ children }) => {
  const { user } = useUser();

  return (
    <div className="flex h-full min-h-0 overflow-hidden rounded-xl border border-[#1F1109]/[0.12] bg-white shadow-sm">
      {user && (
        <div className="h-full w-14 shrink-0 overflow-hidden border-r border-[#1F1109]/[0.08] sm:w-16 md:w-64">
          <UnreadSendersList userId={user.id} />
        </div>
      )}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">{children}</div>
    </div>
  );
};

export default ChatWrapper;
