import React, { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { Send } from "lucide-react";
import { SOCKET_URL } from "../services/config";
import { getMediaUrl } from "../services/config";
import { usePublicUser } from "../hooks/usePublicUser";

interface Message {
  id: number;
  from: number;
  text: string;
  createdAt: string;
}

interface ChatProps {
  otherUserId: number;
  userId: number;
}

const Chat: React.FC<ChatProps> = ({ otherUserId, userId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const { user: otherUser, loading } = usePublicUser(otherUserId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const socket = io(SOCKET_URL, { withCredentials: true });
    socketRef.current = socket;

    socket.emit("join-chat", { otherUserId });

    socket.on("message", (msg: Message) => {
      setMessages((prev) => [...prev, msg]);

      if (msg.from !== userId) {
        socket.emit("message:seen", { messageId: msg.id });
      }
    });

    return () => {
      setMessages([]);
      socket.disconnect();
    };
  }, [otherUserId, userId]);

  const sendMessage = () => {
    if (!input.trim() || !socketRef.current) return;

    socketRef.current.emit("message", { otherUserId, text: input });
    setInput("");
  };

  const displayName = otherUser
    ? [otherUser.title, otherUser.username].filter(Boolean).join(" ")
    : loading
      ? "Loading…"
      : "Conversation";
  const avatarSource =
    otherUser?.profilePictureThumbnailUrl || otherUser?.profilePictureUrl;
  const avatar = avatarSource ? getMediaUrl(avatarSource) : "";

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col bg-[#FAF5EB]">
      <header className="flex shrink-0 items-center gap-3 border-b border-[#1F1109]/10 bg-[#F4ECDD] px-3 py-2.5 sm:px-4">
        {avatar ? (
          <img
            src={avatar}
            alt=""
            className="h-9 w-9 shrink-0 rounded-full object-cover ring-2 ring-[#B8893D]/30"
          />
        ) : (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1F1109] text-sm font-medium text-[#F4ECDD]">
            {(otherUser?.username || "?").charAt(0).toUpperCase()}
          </div>
        )}
        <h2
          className="min-w-0 truncate text-base font-medium text-[#1F1109] sm:text-lg"
          style={{ fontFamily: "Georgia, serif" }}
        >
          {displayName}
        </h2>
      </header>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-3 py-4 sm:px-4">
        {messages.length === 0 && (
          <p className="pt-8 text-center text-sm text-[#6B5640]">
            Send a message to start the conversation.
          </p>
        )}
        {messages.map((msg) => {
          const mine = msg.from === userId;
          return (
            <div
              key={msg.id}
              className={`flex ${mine ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] break-words rounded-2xl px-3 py-2 shadow-sm sm:max-w-[75%] ${
                  mine
                    ? "bg-[#B8893D] text-[#1F1109]"
                    : "border border-[#1F1109]/10 bg-white text-[#1F1109]"
                }`}
              >
                <p className="text-sm leading-relaxed">{msg.text}</p>
                <div
                  className={`mt-1 text-right text-[11px] ${
                    mine ? "text-[#1F1109]/60" : "text-[#6B5640]"
                  }`}
                >
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <form
        className="shrink-0 border-t border-[#1F1109]/10 bg-[#F4ECDD] p-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] sm:p-3"
        onSubmit={(event) => {
          event.preventDefault();
          sendMessage();
        }}
      >
        <div className="flex min-w-0 items-center gap-2">
          <input
            type="text"
            className="min-w-0 flex-1 rounded-full border border-[#1F1109]/15 bg-white px-3.5 py-2.5 text-sm text-[#1F1109] outline-none placeholder:text-[#9C8366] focus:border-[#B8893D]"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            type="submit"
            className="inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-full bg-[#B8893D] px-3.5 text-sm font-medium text-[#1F1109] transition hover:bg-[#A37728] sm:px-4"
            aria-label="Send message"
          >
            <Send className="h-4 w-4" strokeWidth={2} />
            <span className="hidden min-[380px]:inline">Send</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chat;
