import React, { useEffect, useRef, useState } from "react";
import { Send, Sparkles, X } from "lucide-react";
import type { CreatePeriodicBatchSlotsInput } from "@chess-master/schemas";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { parseScheduleFromText } from "../../services/api/chatbot.api";
import { createPeriodicBatchSlots } from "../../services/schedule";
import { useUser } from "../../contexts/UserContext";
import { suggestedSlotPrice } from "../../utils/slotPricing";

type ChatMessage = {
  role: "assistant" | "user";
  content: string;
};

const WELCOME_MESSAGE =
  "I'm your AI schedule assistant. Describe when you want to offer sessions — for example:";

const EXAMPLE_MESSAGE =
  "Every Monday from 10:00am to 6:00pm for 8 weeks, with 60-minute slots";

const INITIAL_MESSAGES: ChatMessage[] = [
  { role: "assistant", content: WELCOME_MESSAGE },
  { role: "assistant", content: EXAMPLE_MESSAGE },
];

function toBatchInput(
  data: CreatePeriodicBatchSlotsInput,
  hourlyRate: number | null
): Parameters<typeof createPeriodicBatchSlots>[0] {
  const intervalStart =
    data.interval.start instanceof Date
      ? data.interval.start.toISOString()
      : String(data.interval.start);
  const intervalEnd =
    data.interval.end instanceof Date
      ? data.interval.end.toISOString()
      : String(data.interval.end);

  const price =
    data.price != null
      ? data.price
      : suggestedSlotPrice(
          hourlyRate,
          intervalStart,
          intervalEnd,
          data.chunkSizeMinutes
        );

  return {
    interval: {
      start: intervalStart,
      end: intervalEnd,
    },
    chunkSizeMinutes: data.chunkSizeMinutes,
    period: data.period,
    repeatCount: data.repeatCount,
    title: data.title,
    description: data.description,
    price,
    youtubeId: data.youtubeId,
  };
}

interface ScheduleChatbotProps {
  onSlotsCreated?: () => Promise<void> | void;
}

const ScheduleChatbot: React.FC<ScheduleChatbotProps> = ({ onSlotsCreated }) => {
  const { user } = useUser();
  const hourlyRate =
    user?.hourlyRate != null ? Number(user.hourlyRate) : null;
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, statusMessage, open]);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages(INITIAL_MESSAGES);
    }
  }, [open, messages.length]);

  const handleOpen = () => setOpen(true);

  const handleClose = () => {
    setOpen(false);
    setStatusMessage(null);
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isSubmitting) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setIsSubmitting(true);

    try {
      setStatusMessage("Reading your schedule…");
      const parsedSchedules = await parseScheduleFromText(text);

      setStatusMessage("Adding slots to your calendar…");
      const results = await Promise.all(
        parsedSchedules.map((schedule) =>
          createPeriodicBatchSlots(toBatchInput(schedule, hourlyRate))
        )
      );
      const totalCreated = results.reduce(
        (sum, result) => sum + result.createdSlots,
        0
      );
      await onSlotsCreated?.();

      const scheduleLabel =
        parsedSchedules.length === 1 ? "schedule" : "schedules";
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Done! I added ${totalCreated} slot${totalCreated === 1 ? "" : "s"} across ${parsedSchedules.length} ${scheduleLabel}. Describe another schedule anytime.`,
        },
      ]);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong.";
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `I couldn't set up that schedule. ${message} Please try again with a clearer description.`,
        },
      ]);
    } finally {
      setIsSubmitting(false);
      setStatusMessage(null);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={handleOpen}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-[#3D2817] px-4 py-3 text-white shadow-lg transition hover:bg-[#2A1A0F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8893D] focus-visible:ring-offset-2"
        aria-label="Open AI schedule assistant"
      >
        <Sparkles className="h-5 w-5 shrink-0" />
        <span className="text-sm font-medium">AI Assistant</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex w-[min(100vw-2rem,24rem)] flex-col overflow-hidden rounded-2xl border border-[#1F1109]/[0.12] bg-[#FAF5EB] shadow-xl">
      <div className="flex items-start justify-between border-b border-[#1F1109]/[0.12] bg-white px-4 py-3">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <Sparkles className="h-4 w-4 shrink-0 text-[#B8893D]" aria-hidden />
            <h3
              className="text-base font-medium text-[#1F1109]"
              style={{ fontFamily: "Georgia, 'Playfair Display', serif" }}
            >
              AI Schedule Assistant
            </h3>
            <span className="rounded-full bg-[#B8893D]/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#6B4F1F]">
              AI
            </span>
          </div>
          <p className="text-sm text-[#5C4631] leading-relaxed">
            Not live support — describe your availability and I&apos;ll add slots to your calendar.
          </p>
        </div>
        <button
          type="button"
          onClick={handleClose}
          className="ml-3 shrink-0 rounded-md p-1 text-[#5C4631] transition hover:bg-[#F4ECDD] hover:text-[#1F1109]"
          aria-label="Close AI schedule assistant"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex max-h-80 flex-1 flex-col gap-3 overflow-y-auto px-4 py-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex flex-col ${message.role === "user" ? "items-end" : "items-start"}`}
          >
            {message.role === "assistant" && (
              <span className="mb-1 inline-flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-[#8B6F4E]">
                <Sparkles className="h-3 w-3" aria-hidden />
                AI Assistant
              </span>
            )}
            <div
              className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm leading-relaxed shadow-sm ${
                message.role === "user"
                  ? "bg-[#B8893D] text-white"
                  : "bg-white text-[#1F1109] border border-[#1F1109]/[0.08]"
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}

        {statusMessage && (
          <div className="flex flex-col items-start">
            <span className="mb-1 inline-flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-[#8B6F4E]">
              <Sparkles className="h-3 w-3" aria-hidden />
              AI Assistant
            </span>
            <div className="rounded-2xl border border-[#1F1109]/[0.08] bg-white px-3 py-2 text-sm text-[#5C4631]">
              {statusMessage}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-[#1F1109]/[0.12] bg-white p-4">
        <div className="flex items-end gap-2">
          <Textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder='Describe your schedule, e.g. "Every Monday 10am–6pm for 8 weeks, 60-minute slots"'
            rows={2}
            disabled={isSubmitting}
            className="min-h-[72px] resize-none border-[#1F1109]/[0.12] bg-[#FAF5EB] focus-visible:ring-[#B8893D]"
          />
          <Button
            size="icon"
            className="shrink-0 bg-[#B8893D] hover:bg-[#a07735]"
            onClick={handleSend}
            disabled={!input.trim() || isSubmitting}
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="mt-2 text-[11px] leading-relaxed text-[#8B6F4E]">
          AI-generated responses — double-check slots before sharing your calendar.
        </p>
      </div>
    </div>
  );
};

export default ScheduleChatbot;
