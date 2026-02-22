import React, { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { SOCKET_URL } from "../services/config";
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
  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    console.log("Connecting to socket...");
    const socket = io(SOCKET_URL, { withCredentials: true });
    console.log("Socket connected:");
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
  }, [otherUserId]);

  const sendMessage = () => {
    if (!input.trim() || !socketRef.current) return;

    socketRef.current.emit("message", { otherUserId, text: input });
    setInput("");
  };

  return (
    <div className="h-full flex flex-col items-center justify-center bg-gray-50/50">
      <div className="w-full max-w-[50rem] h-full flex flex-col bg-white shadow-sm border-x">
        <Card className="flex-1 flex flex-col shadow-none border-0 rounded-none h-full">
          <CardHeader className="text-center bg-primary/10 border-b shrink-0">
            <CardTitle className="text-xl">{otherUser?.username}</CardTitle>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col gap-4 p-4 overflow-hidden min-h-0">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-4 p-2">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${
                    msg.from === userId ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`p-3 rounded-2xl max-w-[75%] break-words shadow-sm ${
                      msg.from === userId
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                    <div
                      className={`text-[10px] mt-1 text-right ${
                        msg.from === userId
                          ? "text-primary-foreground/70"
                          : "text-muted-foreground"
                      }`}
                    >
                      {new Date(msg.createdAt).toLocaleTimeString([], {
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
            <div className="flex gap-2 pt-4 border-t mt-auto shrink-0 bg-white">
              <input
                type="text"
                className="flex-1 border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
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
    </div>
  );
};

export default Chat;
