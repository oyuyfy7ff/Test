function LN() {
  return window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.LocalNotifications;
}
function fireTime(ev) {
  const p = ev.date.split("-");
  const t = (ev.time || "09:00").split(":");
  const d = new Date(+p[0], +p[1] - 1, +p[2], +t[0], +t[1], 0);
  return new Date(d.getTime() - (+ev.remind) * 60000);
}
function remindText(ev) {
  const m = +ev.remind;
  if (m === 0) return "ถึงเวลาแล้ว";
  if (m < 60) return "อีก " + m + " นาที";
  if (m < 1440) return "อีก " + (m / 60) + " ชั่วโมง";
  return "อีก " + (m / 1440) + " วัน";
}
async function scheduleAll() {
  const ln = LN();
  if (!ln) return;
  try {
    const pend = await ln.getPending();
    if (pend.notifications.length) await ln.cancel({ notifications: pend.notifications });
    const items = [];
    const now = Date.now();
    events.forEach(function (ev, i) {
      if (ev.remind === undefined || ev.remind === "") return;
      const at = fireTime(ev);
      if (at.getTime() <= now) return;
      items.push({
        id: i + 1,
        title: ev.name,
        body: remindText(ev) + " (" + pretty(ev.date) + ")",
        schedule: { at: at, allowWhileIdle: true }
      });
    });
    if (!items.length) return;
    let perm = await ln.checkPermissions();
    if (perm.display !== "granted") perm = await ln.requestPermissions();
    if (perm.display !== "granted") {
      document.getElementById("err").textContent += "ยังไม่ได้อนุญาตการแจ้งเตือน\n";
      return;
    }
    await ln.schedule({ notifications: items });
  } catch (e) {
    document.getElementById("err").textContent += "แจ้งเตือน: " + e + "\n";
  }
}
