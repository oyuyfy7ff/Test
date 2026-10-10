const SOUNDS = [
  { id: "chime", name: "ระฆังใส" },
  { id: "bell", name: "กระดิ่ง" },
  { id: "melody", name: "ทำนองสั้น" },
  { id: "drop", name: "หยดน้ำ" },
  { id: "beep", name: "บี๊บ" }
];
function soundOf(ev) {
  return SOUNDS.some(function (x) { return x.id === ev.sound; }) ? ev.sound : "chime";
}
function previewSound(id) {
  try {
    const a = new Audio("sounds/" + id + ".wav");
    const r = a.play();
    if (r && r.catch) r.catch(function () {});
  } catch (e) {}
}
async function makeChannels(ln) {
  for (const x of SOUNDS) {
    await ln.createChannel({
      id: "snd_" + x.id,
      name: "เสียง: " + x.name,
      description: "แจ้งเตือนวันสำคัญด้วยเสียง " + x.name,
      importance: 4,
      sound: x.id + ".wav",
      vibration: true
    });
  }
}
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
        channelId: "snd_" + soundOf(ev),
        sound: soundOf(ev) + ".wav",
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
    await makeChannels(ln);
    await ln.schedule({ notifications: items });
  } catch (e) {
    document.getElementById("err").textContent += "แจ้งเตือน: " + e + "\n";
  }
}
