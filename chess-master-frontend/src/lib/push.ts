import { API_URL } from "../services/config";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const raw = atob(base64);
  const output = new Uint8Array(raw.length);

  for (let i = 0; i < raw.length; i++) {
    output[i] = raw.charCodeAt(i);
  }

  return output;
}

export async function enablePush() {
  console.log("Enabling push notifications...");

  if (!("Notification" in window)) {
    console.log("Notifications are not supported.");
    return;
  }

  if (!("serviceWorker" in navigator)) {
    console.log("Service workers are not supported.");
    return;
  }

  // 🚫 User has permanently blocked notifications
  if (Notification.permission === "denied") {
    console.log("Notifications are blocked in browser settings.");
    return;
  }

  // ✅ Already granted → skip permission prompt
  if (Notification.permission !== "granted") {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.log("Push notification permission denied.");
      return;
    }
  }

  const reg = await navigator.serviceWorker.ready;

  // 🔁 Avoid duplicate subscriptions
  let sub = await reg.pushManager.getSubscription();

  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        "BLkiaRFO4vtEFj1Sw3xVEQYb8_fsyo1owR8WEIdXxx4F15i2Xqwh0-kVec1LtjvE35Lg4FwzED00zxym45-bSw4"
      ) as any,
    });
  }

  console.log("Push subscription:", sub);

  await fetch(`${API_URL}/push/subscribe`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(sub),
  });
}
