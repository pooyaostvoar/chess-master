import { getRedisClient } from "./redis";

export const DAILY_CHATBOT_SCHEDULE_MESSAGE_LIMIT = 30;
const CHATBOT_SCHEDULE_RATE_LIMIT_TTL_SECONDS = 60 * 60 * 24;

function chatBotScheduleRateLimitKey(userId: number): string {
  return `chatbot:schedule:${userId}`;
}

export async function consumeChatBotScheduleMessage(
  userId: number,
): Promise<{ allowed: boolean; count: number }> {
  const redis = getRedisClient();
  const key = chatBotScheduleRateLimitKey(userId);
  const count = await redis.incr(key);

  if (count === 1) {
    await redis.expire(key, CHATBOT_SCHEDULE_RATE_LIMIT_TTL_SECONDS);
  }

  return {
    allowed: count <= DAILY_CHATBOT_SCHEDULE_MESSAGE_LIMIT,
    count,
  };
}
