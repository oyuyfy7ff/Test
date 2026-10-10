const KEY = "countdown.events.v1";
const MONTHS = ["มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน","กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"];
let events = load();
let view = "list";
let cal = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
let selDay = null;
let editId = null;
let photo = "";

function $(id) { return document.getElementById(id); }
function load() { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } }
function save() { try { localStorage.setItem(KEY, JSON.stringify(events)); return true; } catch (e) { return false; } }
function el(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text !== undefined) n.textContent = text;
  return n;
}
function parse(d) { const p = d.split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
function today() { const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), n.getDate()); }
function iso(y, m, d) { return y + "-" + String(m + 1).padStart(2, "0") + "-" + String(d).padStart(2, "0"); }
function daysLeft(d) { return Math.round((parse(d) - today()) / 86400000); }
function label(n) { return n === 0 ? "วันนี้!" : n > 0 ? "อีก " + n + " วัน" : "ผ่านมา " + (-n) + " วัน"; }
function pretty(d) { const x = parse(d); return x.getDate() + " " + MONTHS[x.getMonth()] + " " + (x.getFullYear() + 543); }

function card(ev) {
  const n = daysLeft(ev.date);
  const c = el("div", "card" + (n < 0 ? " past" : ""));
  if (ev.photo) { const i = el("img", "thumb"); i.src = ev.photo; i.alt = ""; c.appendChild(i); }
  const mid = el("div", "mid");
  mid.appendChild(el("div", "name", ev.name));
  mid.appendChild(el("div", "sub", pretty(ev.date)));
  if (ev.note) mid.appendChild(el("div", "sub", ev.note));
  c.appendChild(mid);
  c.appendChild(el("div", "badge", label(n)));
  const del = el("button", "del", "🗑");
  del.type = "button";
  del.setAttribute("aria-label", "ลบ");
  del.addEventListener("click", function (e) { e.stopPropagation(); remove(ev.id); });
  c.appendChild(del);
  c.addEventListener("click", function () { openSheet(ev.id); });
  return c;
}

function renderList() {
  const box = $("list");
  box.textContent = "";
  if (!events.length) { box.appendChild(el("p", "empty", "ยังไม่มีวันสำคัญ กด ＋ เพื่อเพิ่ม")); return; }
  const sorted = events.slice().sort(function (a, b) {
    const x = daysLeft(a.date), y = daysLeft(b.date);
    if ((x < 0) !== (y < 0)) return x < 0 ? 1 : -1;
    return x < 0 ? y - x : x - y;
  });
  const next = sorted.find(function (e) { return daysLeft(e.date) >= 0; });
  if (next) {
    const n = daysLeft(next.date);
    const h = el("div", "hero");
    h.appendChild(el("div", "herolabel", "วันสำคัญถัดไป"));
    h.appendChild(el("div", "herotitle", next.name));
    h.appendChild(el("div", "herodays", n === 0 ? "วันนี้!" : String(n)));
    if (n > 0) h.appendChild(el("div", "herolabel", "วัน"));
    box.appendChild(h);
  }
  sorted.forEach(function (ev) { box.appendChild(card(ev)); });
}

function renderCal() {
  const y = cal.getFullYear(), m = cal.getMonth();
  $("monthlabel").textContent = MONTHS[m] + " " + (y + 543);
  const g = $("grid");
  g.textContent = "";
  ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"].forEach(function (t) { g.appendChild(el("div", "dow", t)); });
  const first = new Date(y, m, 1).getDay();
  const count = new Date(y, m + 1, 0).getDate();
  const td = today();
  const t = iso(td.getFullYear(), td.getMonth(), td.getDate());
  for (let i = 0; i < first; i++) g.appendChild(el("div", "cell blank"));
  for (let d = 1; d <= count; d++) {
    const key = iso(y, m, d);
    const has = events.some(function (e) { return e.date === key; });
    const c = el("button", "cell" + (key === t ? " now" : "") + (key === selDay ? " sel" : ""), String(d));
    c.type = "button";
    if (has) c.appendChild(el("span", "dot"));
    c.addEventListener("click", function () { selDay = key; renderCal(); });
    g.appendChild(c);
  }
  const de = $("dayevents");
  de.textContent = "";
  if (selDay) {
    de.appendChild(el("h3", "", pretty(selDay)));
    const list = events.filter(function (e) { return e.date === selDay; });
    if (!list.length) de.appendChild(el("p", "empty", "ไม่มีวันสำคัญในวันนี้"));
    list.forEach(function (e) { de.appendChild(card(e)); });
  }
}

function render() { if (view === "list") renderList(); else renderCal(); }
function show(v) {
  view = v;
  $("view-list").hidden = v !== "list";
  $("view-cal").hidden = v !== "cal";
  $("tab-list").classList.toggle("on", v === "list");
  $("tab-cal").classList.toggle("on", v === "cal");
  $("title").textContent = v === "list" ? "วันสำคัญ" : "ปฏิทิน";
  render();
}

function showPhoto() {
  const b = $("photobox");
  b.textContent = "";
  if (photo) {
    const i = el("img", "preview");
    i.src = photo; i.alt = "";
    b.appendChild(i);
    const r = el("button", "ghost", "ลบรูป");
    r.type = "button";
    r.addEventListener("click", function () { photo = ""; showPhoto(); });
    b.appendChild(r);
  }
  $("photobtn").textContent = photo ? "📷 เปลี่ยนรูป" : "📷 เพิ่มรูป";
}

function openSheet(id) {
  editId = id || null;
  const t = today();
  const ev = events.find(function (e) { return e.id === id; }) ||
    { name: "", date: (view === "cal" && selDay) ? selDay : iso(t.getFullYear(), t.getMonth(), t.getDate()), note: "", photo: "" };
  $("sheettitle").textContent = id ? "แก้ไขวันสำคัญ" : "เพิ่มวันสำคัญ";
  $("f-name").value = ev.name;
  $("f-date").value = ev.date;
  $("f-note").value = ev.note;
  photo = ev.photo;
  $("formerr").textContent = "";
  showPhoto();
  $("sheet").hidden = false;
}

function remove(id) { events = events.filter(function (e) { return e.id !== id; }); save(); render(); }

$("photobtn").addEventListener("click", function () { $("f-photo").click(); });
$("f-photo").addEventListener("change", function (e) {
  const file = e.target.files[0];
  if (!file) return;
  const r = new FileReader();
  r.onload = function () {
    const img = new Image();
    img.onload = function () {
      const s = Math.min(1, 720 / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * s);
      c.height = Math.round(img.height * s);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      photo = c.toDataURL("image/jpeg", 0.7);
      showPhoto();
    };
    img.onerror = function () { $("formerr").textContent = "เปิดรูปนี้ไม่ได้"; };
    img.src = r.result;
  };
  r.readAsDataURL(file);
  e.target.value = "";
});

$("save").addEventListener("click", function () {
  const name = $("f-name").value.trim();
  const date = $("f-date").value;
  if (!name) { $("formerr").textContent = "ใส่ชื่อก่อน"; return; }
  if (!date) { $("formerr").textContent = "เลือกวันที่ก่อน"; return; }
  const data = { name: name, date: date, note: $("f-note").value.trim(), photo: photo };
  const old = events.slice();
  if (editId) {
    events = events.map(function (e) { return e.id === editId ? Object.assign({ id: editId }, data) : e; });
  } else {
    events.push(Object.assign({ id: String(Date.now()) }, data));
  }
  if (!save()) { events = old; $("formerr").textContent = "เก็บไม่ได้ (พื้นที่เต็ม ลองรูปเล็กลงหรือลบรายการเก่า)"; return; }
  $("sheet").hidden = true;
  render();
});
$("cancel").addEventListener("click", function () { $("sheet").hidden = true; });
$("fab").addEventListener("click", function () { openSheet(); });
$("tab-list").addEventListener("click", function () { show("list"); });
$("tab-cal").addEventListener("click", function () { show("cal"); });
$("prev").addEventListener("click", function () { cal = new Date(cal.getFullYear(), cal.getMonth() - 1, 1); renderCal(); });
$("next").addEventListener("click", function () { cal = new Date(cal.getFullYear(), cal.getMonth() + 1, 1); renderCal(); });

show("list");
