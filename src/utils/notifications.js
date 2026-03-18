export async function requestNotificationPermission() {
  if (!("Notification" in window)) return "unsupported";
  if ("serviceWorker" in navigator) {
    try {
      const reg = await navigator.serviceWorker.ready;
      if (reg) return await Notification.requestPermission();
    } catch {}
  }
  return await Notification.requestPermission();
}

export async function sendLocalNotification(title, body) {
  if (Notification.permission !== "granted") return;
  try {
    const reg = await navigator.serviceWorker.ready;
    await reg.showNotification(title, {
      body,
      icon: "/meow.png",
      badge: "/meow.png",
      tag: "daily-reminder",
      renotify: true,
    });
  } catch {
    try { new Notification(title, { body, icon: "/meow.png" }); } catch {}
  }
}

export function scheduleLocalReminder() {
  const now = new Date();
  const next9pm = new Date();
  next9pm.setHours(21, 0, 0, 0);
  if (now >= next9pm) next9pm.setDate(next9pm.getDate() + 1);
  const fire = () => {
    sendLocalNotification("Meowlett", "Sudah catat pengeluaran hari ini belum?");
    setTimeout(fire, 24 * 60 * 60 * 1000);
  };
  setTimeout(fire, next9pm - now);
}
