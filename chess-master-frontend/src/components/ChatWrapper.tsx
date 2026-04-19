import React from "react";
import { useUser } from "../contexts/UserContext";
import UnreadSendersList from "./UnreadSendersList";

interface ChatWrapperProps {
  children: React.ReactNode;
}

const ChatWrapper: React.FC<ChatWrapperProps> = ({ children }) => {
  const { user } = useUser();

  return (
    <div className="flex h-[70vh] overflow-hidden border border-[#1F1109]/[0.12] rounded-xl my-4 mx-auto max-w-5xl shadow-sm bg-white">
      {user && (
        <div className="w-16 md:w-64 border-r border-[#1F1109]/[0.08] flex-shrink-0 h-full overflow-hidden transition-all duration-300">
          <UnreadSendersList userId={user.id} />
        </div>
      )}
      <div className="flex-1 flex flex-col min-w-0">{children}</div>
    </div>
  );
};

export default ChatWrapper;
