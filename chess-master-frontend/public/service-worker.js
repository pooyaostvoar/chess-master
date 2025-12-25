// public/service-worker.js
self.addEventListener("install", (event) => {
  console.log("Service Worker installed");
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("Service Worker activated");
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  console.log("Push received!", event);

  let data = {
    title: "Notification",
    body: "You have a new message",
    icon: "/icon.png",
    badge: "/badge.png",
  };

  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }

  console.log("Showing event data:", data);

  const options = {
    body: data.body,
    icon: data.icon || "/icon.png",
    badge: data.badge || "/badge.png",
    vibrate: [200, 100, 200],
    tag: "notification-tag",
    requireInteraction: false,
    data: { link: data.data?.link }, // Store the link in notification data
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Handle notification click
self.addEventListener("notificationclick", (event) => {
  console.log("Notification clicked");
  event.notification.close();

  const link = event.notification.data?.link;

  if (link) {
    event.waitUntil(
      clients
        .matchAll({ type: "window", includeUncontrolled: true })
        .then((clientList) => {
          // Check if any window is already open with that URL
          for (let client of clientList) {
            if (client.url === link && "focus" in client) {
              return client.focus();
            }
          }
          // If no window with that URL exists, open a new one
          if (clients.openWindow) {
            return clients.openWindow(link);
          }
        })
    );
  }
});
