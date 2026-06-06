import OpenAI from "openai";
import {
  createPeriodicBatchSlotsInputSchema,
  Period,
  type CreatePeriodicBatchSlotsInput,
} from "@chess-master/schemas";
import { getOpenAiApiKey } from "../utils/secret";

const createPeriodicBatchSlotsItemJsonSchema = {
  type: "object",
  properties: {
    interval: {
      type: "object",
      properties: {
        start: {
          type: "string",
          description:
            "ISO 8601 UTC datetime (Z suffix) for the first occurrence start, converted from the user's local timezone",
        },
        end: {
          type: "string",
          description:
            "ISO 8601 UTC datetime (Z suffix) for the first occurrence end, converted from the user's local timezone",
        },
      },
      required: ["start", "end"],
      additionalProperties: false,
    },
    chunkSizeMinutes: {
      type: "number",
      description:
        "Slot duration in minutes. Default to 60 unless the user explicitly mentions slot length or duration.",
    },
    period: {
      type: "string",
      enum: Object.values(Period),
      description: "How often to repeat the interval",
    },
    repeatCount: {
      type: "integer",
      minimum: 1,
      description: "Number of times to repeat the interval",
    },
  },
  required: ["interval", "chunkSizeMinutes", "period", "repeatCount"],
  additionalProperties: false,
} as const;

const parseSchedulesFromTextJsonSchema = {
  type: "object",
  properties: {
    schedules: {
      type: "array",
      description:
        "One entry per distinct schedule pattern described by the user",
      items: createPeriodicBatchSlotsItemJsonSchema,
      minItems: 1,
    },
  },
  required: ["schedules"],
  additionalProperties: false,
} as const;

let openAiClient: OpenAI | null = null;

export function getOpenAiClient(): OpenAI {
  if (!openAiClient) {
    const apiKey = getOpenAiApiKey();
    if (!apiKey) {
      throw new Error("OpenAI API key not configured");
    }
    openAiClient = new OpenAI({ apiKey });
  }
  return openAiClient;
}

export class OpenAiScheduleParseError extends Error {
  readonly statusCode = 422;

  readonly details?: unknown;

  constructor(message: string, details?: unknown) {
    super(message);
    this.name = "OpenAiScheduleParseError";
    this.details = details;
  }
}

function isValidTimeZone(timeZone: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone });
    return true;
  } catch {
    return false;
  }
}

function resolveTimeZone(raw: unknown): string {
  if (typeof raw === "string" && raw.trim() && isValidTimeZone(raw.trim())) {
    return raw.trim();
  }
  return "UTC";
}

function formatDateTimeInTimeZone(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone,
    dateStyle: "full",
    timeStyle: "long",
  }).format(date);
}

function userSpecifiedChunkSize(userText: string): boolean {
  return /\b(\d+\s*(?:min(?:ute)?s?|hrs?|hours?)|(?:slot|chunk|session)\s*(?:length|size|duration|of)|(?:half|quarter)\s*hour)\b/i.test(
    userText,
  );
}

export async function parseScheduleFromText(
  userText: string,
  timeZoneRaw?: unknown,
): Promise<CreatePeriodicBatchSlotsInput[]> {
  const timeZone = resolveTimeZone(timeZoneRaw);
  const now = new Date();
  const nowInUserTimeZone = formatDateTimeInTimeZone(now, timeZone);
  const nowIso = now.toISOString();

  const response = await getOpenAiClient().responses.create({
    model: "gpt-4.1-mini",
    input: [
      {
        role: "system",
        content:
          "Convert natural-language schedule descriptions into periodic batch slot data. " +
          `The user's timezone is ${timeZone}. ` +
          `Current local date and time for the user is ${nowInUserTimeZone}. ` +
          `Current UTC time is ${nowIso}. ` +
          "Interpret all clock times in the user's message (e.g. 8:00 to 13:00) as local times in the user's timezone, never as UTC. " +
          "Output interval.start and interval.end as ISO 8601 UTC strings with a Z suffix, converted from those local times. " +
          "interval.start and interval.end must both be in the future (after now). " +
          "When the user says a weekday or date without a year, pick the next matching future date in the user's timezone. " +
          "When the user says every day for N days, use period=daily and repeatCount=N. " +
          "Return one or more entries in schedules. Use separate entries when the user describes multiple patterns (e.g. Monday and Wednesday, or mornings and evenings). " +
          "period must be daily, weekly, or monthly. " +
          "chunkSizeMinutes is slot length in minutes and defaults to 60. Only use a different value when the user explicitly mentions slot length or duration (e.g. 45-minute slots). " +
          "repeatCount is how many times to repeat.",
      },
      {
        role: "user",
        content: userText,
      },
    ],
    text: {
      format: {
        type: "json_schema",
        name: "create_periodic_batch_slots_list",
        strict: true,
        schema: parseSchedulesFromTextJsonSchema,
      },
    },
  });

  const rawJson = response.output_text;
  if (!rawJson) {
    throw new OpenAiScheduleParseError("Failed to parse schedule from text");
  }

  let raw: unknown;
  try {
    raw = JSON.parse(rawJson);
  } catch {
    throw new OpenAiScheduleParseError("Failed to parse schedule from text");
  }

  if (
    typeof raw !== "object" ||
    raw === null ||
    !Array.isArray((raw as { schedules?: unknown }).schedules) ||
    (raw as { schedules: unknown[] }).schedules.length === 0
  ) {
    throw new OpenAiScheduleParseError(
      "Model output did not match expected schema",
    );
  }

  const defaultChunkSize = userSpecifiedChunkSize(userText) ? undefined : 60;
  const schedules: CreatePeriodicBatchSlotsInput[] = [];

  for (const item of (raw as { schedules: unknown[] }).schedules) {
    const parsed = createPeriodicBatchSlotsInputSchema.safeParse(item);
    if (!parsed.success) {
      throw new OpenAiScheduleParseError(
        "Model output did not match expected schema",
        parsed.error.flatten(),
      );
    }

    schedules.push({
      ...parsed.data,
      chunkSizeMinutes: defaultChunkSize ?? parsed.data.chunkSizeMinutes ?? 60,
    });
  }

  for (const schedule of schedules) {
    if (schedule.interval.start <= now || schedule.interval.end <= now) {
      throw new OpenAiScheduleParseError(
        "interval.start and interval.end must be in the future",
      );
    }
  }

  return schedules;
}
