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
