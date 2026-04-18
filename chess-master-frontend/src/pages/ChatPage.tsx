import React from "react";
import { useNavigate, useParams } from "react-router-dom";

import Chat from "../components/Chat";
import ChatWrapper from "../components/ChatWrapper";
import { useUser } from "../contexts/UserContext";

const ChatPage: React.FC = () => {
  const { user, loading: userLoading } = useUser();
  const navigate = useNavigate();
  const { otherUserId } = useParams<{ otherUserId: string }>();

  if (userLoading === false && !user) {
    navigate("/login");
    return null;
  }

  return user?.id ? (
    <div className="bg-[#FAF5EB] min-h-screen">
      {/* Header */}
      <div className="bg-[#F4ECDD] border-b border-[#1F1109]/[0.08]">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 py-8 sm:py-10">
          <div
            className="text-xs italic text-[#7A2E2E] tracking-[0.04em] mb-2"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Conversations
          </div>
          <h1
            className="text-2xl sm:text-3xl font-medium text-[#1F1109] leading-[1.1] tracking-[-0.01em]"
            style={{ fontFamily: "Georgia, 'Playfair Display', serif" }}
          >
            Messages
          </h1>
        </div>
      </div>

      <div className="px-5 sm:px-8 py-6">
        <ChatWrapper>
          {otherUserId ? (
            <Chat userId={user.id} otherUserId={Number(otherUserId)} />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-[#6B5640]">
              <svg viewBox="0 0 45 45" className="w-10 h-10 mb-4 opacity-30">
                <g fill="#5C4631" fillRule="evenodd">
                  <path d="M 22,10 C 32.5,11 38.5,18 38,39 L 15,39 C 15,30 25,32.5 23,18" />
                  <path d="M 24,18 C 24.38,20.91 18.45,25.37 16,27 C 13,29 13.18,31.34 11,31 C 9.958,30.06 12.41,27.96 11,28 C 10,28 11.19,29.23 10,30 C 9,30 5.997,31 6,26 C 6,24 12,14 12,14 C 12,14 13.89,12.1 14,10.5 C 13.27,9.506 13.5,8.5 13.5,7.5 C 14.5,5.5 16.5,4.5 16.5,4.5 L 18,7 L 18,3.5 L 19.5,2.5 L 21,5.5 L 21,2.5 L 22.5,4 L 22.5,5.5 C 26.5,4.5 30.5,7 32.5,12 L 32.5,16 L 31,17 L 29.5,18 C 29.5,18 27.5,18.5 26.5,18.5 L 24,18 z" />
                </g>
              </svg>
              <p
                className="text-base font-medium text-[#1F1109] mb-1"
                style={{ fontFamily: "Georgia, serif" }}
              >
                Select a conversation
              </p>
              <p className="text-xs text-[#6B5640]">
                Choose a user from the list to start chatting
              </p>
            </div>
          )}
        </ChatWrapper>
      </div>
    </div>
  ) : null;
};

export default ChatPage;
