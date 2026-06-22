import {
  STORAGE_KEY, DEFAULTS, WEEKDAY_ORDER, GEN, RECUR, DAY, GROUPS,
} from "./schedule.js";

/* ----------------------------- State / storage ------------------------- */
let TIMES = loadTimes();
let viewOffset = 0;        // 0 = today (live); +/- previews other days
let dutiesOnly = false;
let lastSig = "";          // signature to detect when a full re-render is needed

function deepDefaults() {
  return JSON.parse(JSON.stringify(DEFAULTS));
}

function loadTimes() {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    if (s) {
      const p = JSON.parse(s);
      return {
        weekday: { ...DEFAULTS.weekday, ...(p.weekday || {}) },
        sunday: { ...DEFAULTS.sunday, ...(p.sunday || {}) },
        saturday: { ...DEFAULTS.saturday, ...(p.saturday || {}) },
      };
    }
  } catch (e) {
    /* corrupt or unavailable storage — fall back to defaults */
  }
  return deepDefaults();
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(TIMES));
    return true;
  } catch (e) {
    return false;
  }
}

/* ------------------------------- Time helpers -------------------------- */
const VALID_TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

function toDate(base, hhmm) {
  const safe = VALID_TIME.test(hhmm) ? hhmm : "00:00";
  const [h, m] = safe.split(":");
  const d = new Date(base);
  d.setHours(+h, +m, 0, 0);
  return d;
}

function mergeItem(base, ov) {
  if (!ov) return;
  ["label", "detail", "mine"].forEach((k) => {
    if (ov[k] !== undefined) base[k] = ov[k];
  });
}

function buildTimeline(base) {
  const dow = base.getDay();
  const d = DAY[dow];
  const rows = [];
  if (d.special) {
    const tt = TIMES[d.special];
    d.order.forEach((id) => {
      const it = { label: id, detail: "", mine: false };
      mergeItem(it, d.items[id]);
      rows.push({ start: toDate(base, tt[id]), label: it.label, detail: it.detail, mine: it.mine });
    });
  } else {
    WEEKDAY_ORDER.forEach((id) => {
      const it = { label: GEN[id], detail: "", mine: false };
      mergeItem(it, RECUR[id]);
      mergeItem(it, d.items && d.items[id]);
      rows.push({ start: toDate(base, TIMES.weekday[id]), label: it.label, detail: it.detail, mine: it.mine });
    });
  }
  rows.sort((a, b) => a.start - b.start);
  return { dow, day: d, rows };
}

function dayBase(offset) {
  const t = new Date();
  t.setDate(t.getDate() + offset);
  t.setHours(0, 0, 0, 0);
  return t;
}

function firstBlockOfNextDay(now) {
  const t = new Date(now);
  t.setDate(t.getDate() + 1);
  t.setHours(0, 0, 0, 0);
  const r = buildTimeline(t);
  return { block: r.rows[0], dayName: r.day.name };
}

function fmt12(d) {
  let h = d.getHours();
  const m = d.getMinutes();
  const ap = h >= 12 ? "pm" : "am";
  h = h % 12 || 12;
  return { hm: h + ":" + String(m).padStart(2, "0"), ap };
}

function dur(ms) {
  const mins = Math.max(0, Math.round(ms / 60000));
  if (mins < 1) return "in <1m";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return "in " + (h ? h + "h " : "") + m + "m";
}

/* --------------------------------- DOM --------------------------------- */
const $ = (id) => document.getElementById(id);

/* ------------------------------ Rendering ------------------------------ */
function currentIndex(rows, now) {
  let cur = -1;
  for (let i = 0; i < rows.length; i++) {
    if (rows[i].start <= now) cur = i;
    else break;
  }
  return cur;
}

function render() {
  const now = new Date();
  updateClock(now);

  const base = dayBase(viewOffset);
  const { dow, day, rows } = buildTimeline(base);
  const isToday = viewOffset === 0;
  const cur = isToday ? currentIndex(rows, now) : -1;

  // day meta
  $("cDay").textContent = "Day " + (dow + 1) + " \u00b7 " + day.name;
  $("cTheme").textContent = day.theme ? ("Theme: " + day.theme) : "";
  const prev = $("cPreview");
  prev.style.display = isToday ? "none" : "inline-block";
  if (!isToday) prev.textContent = "Previewing";

  $("dayLabel").textContent = isToday ? "Today" : day.name;
  $("backToday").classList.toggle("show", !isToday);

  // now / next cards (live only)
  const nowCard = $("nowCard");
  const nextCard = $("nextCard");
  if (!isToday) {
    nowCard.style.display = "none";
    nextCard.style.display = "none";
  } else {
    nowCard.style.display = "";
    renderNow(rows, cur, now);
  }

  renderTimeline(rows, cur, day);
  updateLive(rows, cur, now);

  lastSig = sig(dow, cur, dutiesOnly, viewOffset);
}

function renderNow(rows, cur, now) {
  const nowCard = $("nowCard");
  if (cur === -1) {
    nowCard.className = "now";
    $("nowTitle").textContent = "Nothing scheduled yet";
    $("nowDetail").textContent = "The camp day hasn't started.";
    $("nowSince").textContent = "";
    $("nowBar").style.display = "none";
    setNext(rows[0], now, false);
    return;
  }
  const b = rows[cur];
  nowCard.className = "now" + (b.mine ? " mine" : "");
  $("nowTitle").innerHTML = esc(b.label) + (b.mine ? '<span class="badge">Your duty</span>' : "");
  $("nowDetail").textContent = b.detail || "";
  const s = fmt12(b.start);
  $("nowSince").textContent = "Since " + s.hm + s.ap;
  $("nowBar").style.display = "block";
  if (cur + 1 < rows.length) setNext(rows[cur + 1], now, false);
  else {
    const nx = firstBlockOfNextDay(now);
    setNext(nx.block, now, true, nx.dayName);
  }
}

function setNext(b, now, tomorrow) {
  const card = $("nextCard");
  if (!b) { card.style.display = "none"; return; }
  card.style.display = "flex";
  card.className = "next" + (b.mine ? " mine" : "");
  $("nextTitle").textContent = b.label;
  $("nextDetail").textContent = b.detail || "";
  const s = fmt12(b.start);
  $("nextAt").textContent = (tomorrow ? "Tmrw " : "") + s.hm + s.ap;
  $("nextIn").textContent = dur(b.start - now);
}

function renderTimeline(rows, cur, day) {
  $("tlTitle").textContent = viewOffset === 0 ? "Today" : day.name;
  const ul = $("timeline");
  ul.innerHTML = "";

  const visible = dutiesOnly ? rows.filter((r) => r.mine) : rows;
  $("tlCount").textContent = dutiesOnly
    ? visible.length + " of " + rows.length + " (your duties)"
    : rows.length + " blocks";

  if (!visible.length) {
    const li = document.createElement("li");
    li.className = "empty";
    li.textContent = "No Cabin F duties flagged on " + day.name + ".";
    ul.appendChild(li);
  } else {
    rows.forEach((r, i) => {
      if (dutiesOnly && !r.mine) return;
      const li = document.createElement("li");
      const cls = [];
      if (i < cur) cls.push("done");
      if (i === cur) { cls.push("cur"); li.id = "curRow"; }
      if (r.mine) cls.push("mine");
      li.className = cls.join(" ");
      const s = fmt12(r.start);
      li.innerHTML = '<div class="t">' + s.hm + s.ap + "</div><div><div class=\"nm\">" +
        esc(r.label) + "</div>" +
        (r.detail ? '<div class="dt">' + esc(r.detail) + "</div>" : "") + "</div>";
      ul.appendChild(li);
    });
  }

  const noteEl = $("dayNote");
  if (day.note) { noteEl.style.display = "block"; noteEl.textContent = day.note; }
  else noteEl.style.display = "none";
}

/* Lightweight per-second updates that don't need a full rebuild */
function updateLive(rows, cur, now) {
  if (viewOffset !== 0) { $("fab").classList.remove("show"); return; }
  if (cur === -1) {
    if (rows[0]) $("nextIn").textContent = dur(rows[0].start - now);
    $("nowBar").style.display = "none";
  } else {
    const b = rows[cur];
    const nextStart = cur + 1 < rows.length ? rows[cur + 1].start : firstBlockOfNextDay(now).block.start;
    const total = nextStart - b.start;
    const elapsed = now - b.start;
    const pct = total > 0 ? Math.min(100, Math.max(0, (elapsed / total) * 100)) : 0;
    $("nowBarFill").style.width = pct + "%";
    $("nextIn").textContent = dur(nextStart - now);
  }
  // day progress (06:00 -> lights out window for a friendly bar)
  const dayStart = rows[0] ? rows[0].start : now;
  const dayEnd = rows[rows.length - 1] ? rows[rows.length - 1].start : now;
  const span = dayEnd - dayStart;
  const dp = span > 0 ? Math.min(100, Math.max(0, ((now - dayStart) / span) * 100)) : 0;
  $("dayProgressFill").style.width = dp + "%";

  // jump-to-now FAB when the current row is off-screen
  const row = $("curRow");
  if (row) {
    const r = row.getBoundingClientRect();
    const off = r.bottom < 80 || r.top > window.innerHeight - 40;
    $("fab").classList.toggle("show", off);
  } else {
    $("fab").classList.remove("show");
  }
}

function updateClock(now) {
  const c = fmt12(now);
  $("cTime").textContent = c.hm;
  $("cAmpm").textContent = c.ap;
  $("cSec").textContent = ":" + String(now.getSeconds()).padStart(2, "0");
}

function sig(dow, cur, duties, offset) {
  return [dow, cur, duties, offset].join("|");
}

/* Tick: cheap clock update; full re-render only when structure changes */
function tick() {
  const now = new Date();
  updateClock(now);
  if (viewOffset !== 0) return;
  const { dow, rows } = buildTimeline(dayBase(0));
  const cur = currentIndex(rows, now);
  const s = sig(dow, cur, dutiesOnly, viewOffset);
  if (s !== lastSig) { render(); return; }
  updateLive(rows, cur, now);
}

/* -------------------------------- Edit sheet --------------------------- */
function buildEdit() {
  const host = $("editGroups");
  host.innerHTML = "";
  GROUPS.forEach((g) => {
    const div = document.createElement("div");
    div.className = "grp";
    let html = "<h4>" + g.title + "</h4>";
    g.ids.forEach((id) => {
      html += '<div class="trow"><label>' + g.labels[id] + "</label>" +
        '<input type="time" data-grp="' + g.key + '" data-id="' + id + '" value="' +
        TIMES[g.key][id] + '"></div>';
    });
    div.innerHTML = html;
    host.appendChild(div);
  });
}

function saveTimes() {
  document.querySelectorAll("#editGroups input").forEach((inp) => {
    const g = inp.getAttribute("data-grp");
    const id = inp.getAttribute("data-id");
    if (inp.value && VALID_TIME.test(inp.value)) TIMES[g][id] = inp.value;
  });
  const ok = persist();
  render();
  closeSheet();
  toast(ok ? "Times saved" : "Saved for this session only");
}

function resetTimes() {
  TIMES = deepDefaults();
  try { localStorage.removeItem(STORAGE_KEY); } catch (e) { /* ignore */ }
  buildEdit();
  render();
  toast("Reset to camp defaults");
}

/* --------------------------------- UI glue ----------------------------- */
function openSheet() {
  buildEdit();
  $("sheetBackdrop").classList.add("open");
  $("editSheet").classList.add("open");
  document.body.style.overflow = "hidden";
}
function closeSheet() {
  $("sheetBackdrop").classList.remove("open");
  $("editSheet").classList.remove("open");
  document.body.style.overflow = "";
}

let toastTimer = null;
function toast(msg) {
  const t = $("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
}

function esc(s) {
  return String(s).replace(/[&<>"]/g, (c) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]
  ));
}

function jumpToNow() {
  viewOffset = 0;
  render();
  const row = $("curRow") || $("nowCard");
  if (row) row.scrollIntoView({ behavior: "smooth", block: "center" });
}

function shiftDay(delta) {
  viewOffset = Math.max(-1, Math.min(6, viewOffset + delta));
  render();
}

function wire() {
  $("prevDay").addEventListener("click", () => shiftDay(-1));
  $("nextDay").addEventListener("click", () => shiftDay(1));
  $("backToday").addEventListener("click", () => { viewOffset = 0; render(); });
  $("dutiesToggle").addEventListener("click", (e) => {
    dutiesOnly = !dutiesOnly;
    e.currentTarget.setAttribute("aria-pressed", String(dutiesOnly));
    render();
  });
  $("openEdit").addEventListener("click", openSheet);
  $("bannerEdit").addEventListener("click", openSheet);
  $("sheetClose").addEventListener("click", closeSheet);
  $("sheetBackdrop").addEventListener("click", closeSheet);
  $("saveBtn").addEventListener("click", saveTimes);
  $("resetBtn").addEventListener("click", resetTimes);
  $("fab").addEventListener("click", jumpToNow);
  $("bannerClose").addEventListener("click", () => {
    $("banner").style.display = "none";
    try { localStorage.setItem("ctcc_banner_hidden", "1"); } catch (e) { /* ignore */ }
  });

  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeSheet(); });

  // re-sync immediately when tab regains focus (clock can drift while backgrounded)
  document.addEventListener("visibilitychange", () => { if (!document.hidden) render(); });
}

function init() {
  try {
    if (localStorage.getItem("ctcc_banner_hidden") === "1") $("banner").style.display = "none";
  } catch (e) { /* ignore */ }
  wire();
  render();
  setInterval(tick, 1000);

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js").catch(() => { /* offline still works from cache */ });
    });
  }
}

init();
