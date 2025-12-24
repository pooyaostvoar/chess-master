import React, { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { API_URL } from "../services/config";
import { usePublicUser } from "../hooks/usePublicUser";

interface Message {
  from: number;
  text: string;
  timestamp: number;
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
  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const socket = io(API_URL, { withCredentials: true });
    socketRef.current = socket;

    socket.emit("join-chat", { otherUserId });

    socket.on("message", (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.disconnect();
    };
  }, [otherUserId]);

  const sendMessage = () => {
    if (!input.trim() || !socketRef.current) return;

    socketRef.current.emit("message", { otherUserId, text: input });
    setInput("");
  };

  return (
    <div className="max-w-2xl mx-auto px-5 py-12">
      <Card className="shadow-lg overflow-hidden">
        <CardHeader className="text-center bg-primary/10">
          <CardTitle className="text-2xl">{otherUser?.username}</CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col h-[500px] gap-4 p-4">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-2">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${
                  msg.from === userId ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`p-2 rounded-lg max-w-[70%] break-words ${
                    msg.from === userId
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-900"
                  }`}
                >
                  {msg.text}
                  <div className="text-xs text-gray-400 mt-1 text-right">
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="flex gap-2 mt-auto">
            <input
              type="text"
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <Button onClick={sendMessage} className="flex-shrink-0">
              Send
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Chat;
