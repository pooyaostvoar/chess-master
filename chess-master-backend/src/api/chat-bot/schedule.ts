import { Router } from "express";
import { isAuthenticated } from "../../middleware/passport";
import {
  consumeChatBotScheduleMessage,
  DAILY_CHATBOT_SCHEDULE_MESSAGE_LIMIT,
} from "../../services/chatBotRateLimit";
import {
  OpenAiScheduleParseError,
  parseScheduleFromText,
} from "../../services/openai";
import { logRequestError } from "../../utils/log-request-error";

export const router = Router();

router.post("/", isAuthenticated, async (req, res) => {
  const userText = req.body.text;
  const userId = Number((req.user as { id?: number })?.id);

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (typeof userText !== "string" || !userText.trim()) {
    return res.status(400).json({ error: "text is required" });
  }

  try {
    const { allowed, count } = await consumeChatBotScheduleMessage(userId);
    if (!allowed) {
      return res.status(429).json({
        error: `Daily message limit reached (${DAILY_CHATBOT_SCHEDULE_MESSAGE_LIMIT} per day)`,
        limit: DAILY_CHATBOT_SCHEDULE_MESSAGE_LIMIT,
        count,
      });
    }

    const result = await parseScheduleFromText(userText, req.body.timeZone);
    return res.json(result);
  } catch (err) {
    if (err instanceof OpenAiScheduleParseError) {
      return res.status(err.statusCode).json({
        error: err.message,
        ...(err.details ? { details: err.details } : {}),
      });
    }

    logRequestError(req, err, "Error parsing schedule text");
    return res.status(500).json({ error: "Internal server error" });
  }
});
