import { readSecret } from "../utils/secret";

let url: string | undefined;

function getUrl() {
  if (!url) {
    url =
      readSecret("/run/secrets/email_notification_url") ||
      process.env.EMAIL_NOTIFICATION_URL;
  }
  return url;
}

export async function sendNotificationEmail(data: {
  master: string;
  reservedBy: string;
}) {
  const url = getUrl();
  console.log("Notification URL:", url);
  if (!url) {
    return;
  }
  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((res) => res.json())
    .then((result) => {
      return result;
    })
    .catch((err) => {
      console.error("Error:", err);
    });
}

let telegramToken: string | undefined;
let telegramChatId: number | undefined;

function getTelegramToken() {
  if (!telegramToken) {
    telegramToken = readSecret("/run/secrets/telegram_token") || "dummy_token";
  }
  return telegramToken;
}

function getTelegramChatId() {
  if (!telegramChatId) {
    telegramChatId = Number(readSecret("/run/secrets/telegram_chat_id")) || 0;
  }
  return telegramChatId;
}

export async function sendNotificationToTelegram(data: {
  master: string;
  reservedBy: string;
}) {
  const token = getTelegramToken();
  const chatId = getTelegramChatId();

  if (!token || !chatId) {
    console.error("Missing Telegram token or chat id");
    return;
  }

  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  const text = `
  📢 Reservation Update
  Master: ${data.master}
  Reserved by: ${data.reservedBy}
  `.trim();

  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "Markdown",
    }),
  })
    .then((res) => res.json())
    .catch((err) => {
      console.error("Telegram error:", err);
    });
}
