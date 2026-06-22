import {
  STORAGE_KEY, SETTINGS_KEY, CABINS, GRADES, DEFAULTS, WEEKDAY_ORDER,
  GEN, RECUR, DAY, CLASSES, INFO, GROUPS,
} from "./schedule.js";

/* ----------------------------- State / storage ------------------------- */
let TIMES = loadTimes();
let SETTINGS = loadSettings();
let activeTab = "now";
let weekIndex = new Date().getDay();   // selected day on the Week tab
let lastSig = "";
let draft = { cabin: "", section: "", grade: "" };

function deepDefaults() { return JSON.parse(JSON.stringify(DEFAULTS)); }

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
  } catch (e) { /* corrupt or unavailable storage — fall back to defaults */ }
  return deepDefaults();
}

function persist() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(TIMES)); return true; }
  catch (e) { return false; }
}

function loadSettings() {
  try {
    const p = JSON.parse(localStorage.getItem(SETTINGS_KEY));
    if (p && typeof p === "object") {
      return {
        cabin: p.cabin || "", section: p.section || "", grade: p.grade || "",
        role: p.role || "counselor", configured: !!p.configured,
      };
    }
  } catch (e) { /* ignore */ }
  return { cabin: "", section: "", grade: "", role: "counselor", configured: false };
}

function saveSettings() {
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(SETTINGS)); return true; }
  catch (e) { return false; }
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

function dayBase(offset) {
  const t = new Date();
  t.setDate(t.getDate() + offset);
  t.setHours(0, 0, 0, 0);
  return t;
}

function dateForDow(dow) {
  const t = new Date();
  t.setDate(t.getDate() + (dow - t.getDay()));
  t.setHours(0, 0, 0, 0);
  return t;
}

function fmt12(d) {
  let h = d.getHours();
  const m = d.getMinutes();
  const ap = h >= 12 ? "pm" : "am";
  h = h % 12 || 12;
  return { hm: h + ":" + String(m).padStart(2, "0"), ap };
}

function fmtT(d) { const s = fmt12(d); return s.hm + s.ap; }

function dur(ms) {
  const mins = Math.max(0, Math.round(ms / 60000));
  if (mins < 1) return "in <1m";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return "in " + (h ? h + "h " : "") + m + "m";
}

/* --------------------------- Personalization --------------------------- */
function cabinHit(val, cabin) {
  if (!cabin || !val) return false;
  return Array.isArray(val) ? val.includes(cabin) : val === cabin;
}

function classLocation() {
  const g = SETTINGS.grade;
  if (!g) return null;
  if (CLASSES.junior.locations[g]) return CLASSES.junior.locations[g];
  if (CLASSES.senior.locations[g]) return CLASSES.senior.locations[g];
  return null;
}

function classTier() {
  const g = SETTINGS.grade;
  if (!g) return null;
  if (CLASSES.junior.locations[g]) return "junior";
  if (CLASSES.senior.locations[g]) return "senior";
  return null;
}

function rotIndex(rotation, loc) {
  return rotation.findIndex((r) => loc === r || loc.startsWith(r));
}

/* Teachers rotate one location per day (Mon–Thu); Friday classes combine.
 * Given a day-of-week, returns who teaches the counselor's class that day. */
function classToday(dow) {
  const tier = classTier();
  const loc = classLocation();
  if (!tier || !loc) return null;
  if (dow === 5) return { friday: true, note: tier === "junior" ? CLASSES.juniorFriday : CLASSES.seniorFriday };
  if (dow < 1 || dow > 4) return null; // classes run Mon–Thu
  const rotation = tier === "junior" ? CLASSES.juniorRotation : CLASSES.seniorRotation;
  const teachers = tier === "junior" ? CLASSES.juniorTeachers : CLASSES.seniorTeachers;
  const li = rotIndex(rotation, loc);
  if (li < 0) return null;
  const dayIndex = dow - 1; // Mon=0 … Thu=3
  const n = rotation.length;
  const startLoc = rotation[(((li - dayIndex) % n) + n) % n];
  const teacher = teachers.find((t) => t.start === startLoc);
  return teacher ? { teacher } : null;
}

/* Returns { mine, reason } for a block, given the saved settings. */
function dutyFor(id, day, item) {
  const cabin = SETTINGS.cabin;
  const section = SETTINGS.section;
  const isCounselor = SETTINGS.role !== "camper";
  const a = day.assign || {};

  if (id === "breakfast" && cabinHit(a.breakfast, cabin)) return { mine: true, reason: "Kitchen \u2014 breakfast" };
  if (id === "lunch" && cabinHit(a.lunch, cabin)) return { mine: true, reason: "Kitchen \u2014 lunch" };
  if (id === "supper" && cabinHit(a.supper, cabin)) return { mine: true, reason: "Kitchen \u2014 supper" };
  if (id === "rise" && cabinHit(a.bathhouse, cabin)) return { mine: true, reason: "Bathhouse crew" };
  if (id === "devo" && a.devoLead && a.devoLead === cabin) return { mine: true, reason: "Your cabin leads devo" };

  if (section === "boys" && id === "cabindevo") return { mine: true, reason: "Lead cabin devo" };
  if (section === "girls" && id === "swim") return { mine: true, reason: "Lead cabin devo" };

  if (isCounselor && RECUR[id] && RECUR[id].counselor) return { mine: true, reason: RECUR[id].reason };
  if (isCounselor && item && item.counselor) return { mine: true, reason: item.reason || "Counselor duty" };

  return { mine: false, reason: null };
}

function labelFor(id, item) {
  let label = (item && item.label) ? item.label : (GEN[id] || id);
  const sec = SETTINGS.section;
  if (sec === "boys") {
    if (id === "swim") label = "Your cabin swims";
    if (id === "cabindevo") label = "Cabin devo \u2014 you lead";
  } else if (sec === "girls") {
    if (id === "swim") label = "Cabin devo \u2014 you lead";
    if (id === "cabindevo") label = "Your cabin swims";
  }
  return label;
}

function detailFor(id, item, dow) {
  let det = (item && item.detail) || (RECUR[id] && RECUR[id].detail) || "";
  if (id === "bible") {
    const loc = classLocation();
    if (loc) {
      let add = "Your class: " + loc + ".";
      const ct = classToday(dow);
      if (ct && ct.teacher) add += " Today: " + ct.teacher.name + " (" + ct.teacher.lesson + ").";
      else if (ct && ct.friday) add += " Friday: " + ct.note;
      det = (det ? det + " " : "") + add;
    }
  }
  return det;
}

function buildTimeline(base) {
  const dow = base.getDay();
  const d = DAY[dow];
  const rows = [];
  if (d.special) {
    const tt = TIMES[d.special];
    d.order.forEach((id) => {
      const item = (d.items && d.items[id]) || {};
      const du = dutyFor(id, d, item);
      rows.push({ id, start: toDate(base, tt[id]), label: item.label || id, detail: detailFor(id, item, dow), mine: du.mine, reason: du.reason });
    });
  } else {
    (d.order || WEEKDAY_ORDER).forEach((id) => {
      const item = d.items && d.items[id];
      const du = dutyFor(id, d, item);
      const t = (d.times && d.times[id]) || TIMES.weekday[id];
      rows.push({ id, start: toDate(base, t), label: labelFor(id, item), detail: detailFor(id, item, dow), mine: du.mine, reason: du.reason });
    });
  }
  rows.sort((a, b) => a.start - b.start);
  return { dow, day: d, rows };
}

function firstBlockOfNextDay(now) {
  const t = new Date(now);
  t.setDate(t.getDate() + 1);
  t.setHours(0, 0, 0, 0);
  const r = buildTimeline(t);
  return { block: r.rows[0], dayName: r.day.name };
}

function currentIndex(rows, now) {
  let cur = -1;
  for (let i = 0; i < rows.length; i++) {
    if (rows[i].start <= now) cur = i; else break;
  }
  return cur;
}

/* --------------------------------- DOM --------------------------------- */
const $ = (id) => document.getElementById(id);

function esc(s) {
  return String(s).replace(/[&<>"]/g, (c) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]
  ));
}

/* ------------------------------ Rendering ------------------------------ */
function render() {
  const now = new Date();
  updateClock(now);

  const today = buildTimeline(dayBase(0));
  $("cDay").textContent = "Day " + (today.dow + 1) + " \u00b7 " + today.day.name;
  $("cTheme").textContent = today.day.theme ? ("Theme: " + today.day.theme) : "";
  updateWho();

  if (activeTab === "now") renderNowTab(today.rows, currentIndex(today.rows, now), today.day, now);
  else if (activeTab === "week") renderWeekTab();
  else if (activeTab === "mine") renderMineTab();
  else if (activeTab === "info") renderInfoTab();

  if (activeTab === "now") updateLive(today.rows, currentIndex(today.rows, now), now);
  lastSig = sig(today.dow, currentIndex(today.rows, now), activeTab);
}

/* ---- Now tab ---- */
function renderNowTab(rows, cur, day, now) {
  renderNow(rows, cur, now);

  $("tlTitle").textContent = "Today \u00b7 " + day.name;
  const mineCount = rows.filter((r) => r.mine).length;
  $("tlCount").textContent = rows.length + " blocks" + (mineCount ? " \u00b7 " + mineCount + " yours" : "");
  const ul = $("timeline");
  ul.innerHTML = "";
  rows.forEach((r, i) => ul.appendChild(rowEl(r, i, cur, true)));

  const noteEl = $("dayNote");
  if (day.note) { noteEl.style.display = "block"; noteEl.textContent = day.note; }
  else noteEl.style.display = "none";
}

function rowEl(r, i, cur, live) {
  const li = document.createElement("li");
  const cls = [];
  if (live && i < cur) cls.push("done");
  if (live && i === cur) { cls.push("cur"); li.id = "curRow"; }
  if (r.mine) cls.push("mine");
  li.className = cls.join(" ");
  const s = fmt12(r.start);
  const badge = r.mine && r.reason ? '<span class="rbadge">' + esc(r.reason) + "</span>" : "";
  li.innerHTML = '<div class="t">' + s.hm + s.ap + "</div><div><div class=\"nm\">" +
    esc(r.label) + badge + "</div>" +
    (r.detail ? '<div class="dt">' + esc(r.detail) + "</div>" : "") + "</div>";
  return li;
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
  $("nowTitle").innerHTML = esc(b.label) + (b.mine ? '<span class="badge">' + esc(b.reason || "Your duty") + "</span>" : "");
  $("nowDetail").textContent = b.detail || "";
  const s = fmt12(b.start);
  $("nowSince").textContent = "Since " + s.hm + s.ap;
  $("nowBar").style.display = "block";
  if (cur + 1 < rows.length) setNext(rows[cur + 1], now, false);
  else { const nx = firstBlockOfNextDay(now); setNext(nx.block, now, true); }
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

/* ---- Week tab ---- */
function renderWeekTab() {
  const chips = $("weekChips");
  chips.innerHTML = "";
  const todayDow = new Date().getDay();
  for (let dow = 0; dow < 7; dow++) {
    const b = document.createElement("button");
    b.className = "chip" + (dow === weekIndex ? " on" : "") + (dow === todayDow ? " today" : "");
    b.textContent = DAY[dow].name.slice(0, 3);
    b.addEventListener("click", () => { weekIndex = dow; renderWeekTab(); });
    chips.appendChild(b);
  }

  const { day, rows } = buildTimeline(dateForDow(weekIndex));
  $("weekTitle").textContent = "Day " + (weekIndex + 1) + " \u00b7 " + day.name;
  $("weekTheme").textContent = day.theme ? ("Theme: " + day.theme) : "";
  $("weekCount").textContent = rows.length + " blocks";

  const ul = $("weekTimeline");
  ul.innerHTML = "";
  const live = weekIndex === todayDow;
  const cur = live ? currentIndex(rows, new Date()) : -1;
  rows.forEach((r, i) => ul.appendChild(rowEl(r, i, cur, live)));

  const noteEl = $("weekNote");
  if (day.note) { noteEl.style.display = "block"; noteEl.textContent = day.note; }
  else noteEl.style.display = "none";
}

/* ---- Mine tab ---- */
function renderMineTab() {
  const host = $("mineBody");
  host.innerHTML = "";

  if (!SETTINGS.configured || !SETTINGS.cabin) {
    host.innerHTML = '<div class="prompt"><p>Tell us your cabin and we\u2019ll pull out everything that\u2019s yours \u2014 kitchen shifts, bathhouse crew, devo nights and more.</p>' +
      '<button class="primary" id="minePromptBtn">Set up my cabin</button></div>';
    $("minePromptBtn").addEventListener("click", openSetup);
    return;
  }

  let total = 0;
  for (let dow = 0; dow < 7; dow++) {
    const { day, rows } = buildTimeline(dateForDow(dow));
    const mine = rows.filter((r) => r.mine);
    if (!mine.length) continue;
    total += mine.length;
    const sec = document.createElement("section");
    sec.className = "mineday";
    let html = "<h4>" + esc(day.name) + "</h4><ul>";
    mine.forEach((r) => {
      html += '<li><span class="t">' + esc(fmtT(r.start)) + '</span><span class="m"><b>' +
        esc(r.label) + "</b>" + (r.reason ? ' <span class="rbadge">' + esc(r.reason) + "</span>" : "") +
        (r.detail ? '<span class="dt">' + esc(r.detail) + "</span>" : "") + "</span></li>";
    });
    html += "</ul>";
    sec.innerHTML = html;
    host.appendChild(sec);
  }

  if (!total) {
    host.innerHTML = '<div class="prompt"><p>No duties are flagged for Cabin ' + esc(SETTINGS.cabin) +
      '. Double-check your setup, or you may just be off rotation.</p>' +
      '<button class="primary" id="minePromptBtn">Edit my setup</button></div>';
    $("minePromptBtn").addEventListener("click", openSetup);
  }
}

/* ---- Info tab (slim: one personalized card, the rest collapsible) ---- */
function renderInfoTab() {
  const host = $("infoBody");
  host.innerHTML = "";

  const tier = classTier();
  const loc = classLocation();
  const ct = loc ? classToday(new Date().getDay()) : null;
  const todayName = ct && ct.teacher ? ct.teacher.name : "";

  // 1. Personalized Bible class — leads the tab
  if (loc) {
    let body = '<div class="sub">Grade ' + esc(SETTINGS.grade) + " \u00b7 same spot daily</div>";
    body += '<div class="big">' + esc(loc) + "</div>";
    if (ct && ct.teacher) {
      body += '<p class="fri"><b>Today:</b> ' + esc(ct.teacher.name) + " \u2014 " +
        esc(ct.teacher.lesson) + " \u00b7 " + esc(ct.teacher.text) + "</p>";
    } else if (ct && ct.friday) {
      body += '<p class="fri"><b>Friday:</b> ' + esc(ct.note) + "</p>";
    } else {
      body += '<p class="fri">Bible classes run Mon\u2013Thu (Friday combines).</p>';
    }
    host.appendChild(card("Your Bible class", body, "feature"));
  } else {
    host.appendChild(card("Your Bible class",
      "<p>Add your grade in setup to see your class location and today\u2019s rotating teacher.</p>" +
      '<button class="primary" id="infoSetupBtn" style="margin-top:14px">Add my grade</button>'));
  }

  // 2. Camp awards
  host.appendChild(acc("Camp awards",
    sect(INFO.honorCamper.title, ulPoints(INFO.honorCamper.points)) +
    sect(INFO.hensel.title, ulPoints(INFO.hensel.points))));

  // 3. All Bible classes & teachers — the counselor's tier first
  const jr = sect(CLASSES.junior.title, locList(CLASSES.junior.locations) +
    teacherList(CLASSES.juniorTeachers, tier === "junior" ? todayName : "") + note("Friday: " + CLASSES.juniorFriday));
  const sr = sect(CLASSES.senior.title, locList(CLASSES.senior.locations) +
    teacherList(CLASSES.seniorTeachers, tier === "senior" ? todayName : "") + note("Friday: " + CLASSES.seniorFriday));
  host.appendChild(acc("All Bible classes & teachers",
    (tier === "senior" ? sr + jr : jr + sr) + sect("How it works", "<p>" + esc(CLASSES.note) + "</p>")));

  // 4. Theme days & arrival
  let themes = '<ul class="kv">';
  INFO.themes.forEach((t) => { themes += "<li><span>" + esc(t.day) + "</span><span>" + esc(t.theme) + "</span></li>"; });
  themes += "</ul>";
  host.appendChild(acc("Theme days & arrival",
    sect("Theme days", themes) + sect("Arrival", "<p>" + esc(INFO.arrivalFee) + "</p>")));

  const sb = $("infoSetupBtn");
  if (sb) sb.addEventListener("click", openSetup);
}

function card(title, bodyHtml, cls) {
  const d = document.createElement("section");
  d.className = "info-card" + (cls ? " " + cls : "");
  d.innerHTML = "<h4>" + esc(title) + "</h4>" + bodyHtml;
  return d;
}
function acc(title, bodyHtml, open) {
  const d = document.createElement("details");
  d.className = "acc";
  if (open) d.open = true;
  d.innerHTML = "<summary>" + esc(title) + "</summary><div class=\"acc-b\">" + bodyHtml + "</div>";
  return d;
}
function sect(title, bodyHtml) {
  return '<div class="sect"><h5>' + esc(title) + "</h5>" + bodyHtml + "</div>";
}
function locList(obj) {
  const seen = new Set();
  let html = "<ul class=\"kv\">";
  Object.keys(obj).forEach((g) => {
    const v = obj[g];
    const key = v + "";
    if (seen.has(key)) return; seen.add(key);
    // collapse grade ranges that share a location
    const grades = Object.keys(obj).filter((k) => obj[k] === v);
    const label = grades.length > 1 ? grades[0] + "\u2013" + grades[grades.length - 1] : grades[0];
    html += "<li><span>Grade " + esc(label) + "</span><span>" + esc(v) + "</span></li>";
  });
  return html + "</ul>";
}
function teacherList(arr, todayName) {
  let html = "<div class=\"teachers\">";
  arr.forEach((t) => {
    const hot = todayName && t.name === todayName;
    html += '<div class="tch' + (hot ? " now-tch" : "") + '"><b>' + esc(t.name) +
      (hot ? " \u2022 today" : "") + "</b><span>" + esc(t.start) + "</span><i>" +
      esc(t.lesson) + " \u00b7 " + esc(t.text) + "</i></div>";
  });
  return html + "</div>";
}
function note(txt) { return '<p class="fri">' + esc(txt) + "</p>"; }
function ulPoints(arr) {
  let html = "<ul class=\"pts\">";
  arr.forEach((p) => { html += "<li>" + esc(p) + "</li>"; });
  return html + "</ul>";
}

/* Lightweight per-second updates for the Now tab */
function updateLive(rows, cur, now) {
  if (activeTab !== "now") { $("fab").classList.remove("show"); return; }
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
  const dayStart = rows[0] ? rows[0].start : now;
  const dayEnd = rows[rows.length - 1] ? rows[rows.length - 1].start : now;
  const span = dayEnd - dayStart;
  const dp = span > 0 ? Math.min(100, Math.max(0, ((now - dayStart) / span) * 100)) : 0;
  $("dayProgressFill").style.width = dp + "%";

  const row = $("curRow");
  if (row) {
    const r = row.getBoundingClientRect();
    const off = r.bottom < 100 || r.top > window.innerHeight - 80;
    $("fab").classList.toggle("show", off);
  } else { $("fab").classList.remove("show"); }
}

function updateClock(now) {
  const c = fmt12(now);
  $("cTime").textContent = c.hm;
  $("cAmpm").textContent = c.ap;
  $("cSec").textContent = ":" + String(now.getSeconds()).padStart(2, "0");
}

function updateWho() {
  const el = $("whoPill");
  if (SETTINGS.configured && SETTINGS.cabin) {
    const sec = SETTINGS.section ? " \u00b7 " + SETTINGS.section[0].toUpperCase() + SETTINGS.section.slice(1) : "";
    el.textContent = "Cabin " + SETTINGS.cabin + sec;
    el.classList.remove("unset");
  } else {
    el.textContent = "Set up";
    el.classList.add("unset");
  }
}

function sig(dow, cur, tab) { return [dow, cur, tab].join("|"); }

function tick() {
  const now = new Date();
  updateClock(now);
  if (activeTab !== "now") return;
  const { dow, rows } = buildTimeline(dayBase(0));
  const cur = currentIndex(rows, now);
  const s = sig(dow, cur, activeTab);
  if (s !== lastSig) { render(); return; }
  updateLive(rows, cur, now);
}

/* -------------------------------- Tabs --------------------------------- */
function setTab(name) {
  activeTab = name;
  ["now", "week", "mine", "info"].forEach((t) => {
    $("panel-" + t).classList.toggle("on", t === name);
    $("tab-" + t).classList.toggle("on", t === name);
    $("tab-" + t).setAttribute("aria-selected", String(t === name));
  });
  $("fab").classList.remove("show");
  window.scrollTo({ top: 0 });
  render();
}

/* ----------------------------- Setup / settings ------------------------ */
function ordinalShort(n) {
  const v = +n;
  const s = ["th", "st", "nd", "rd"], k = v % 100;
  return v + (s[(k - 20) % 10] || s[k] || s[0]);
}

/* single-select chip grid: clicking the active chip clears it */
function chipGrid(host, items, selected, label, onPick) {
  host.innerHTML = "";
  items.forEach((it) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "chip" + (selected === it ? " on" : "");
    b.dataset.v = it;
    b.textContent = label ? label(it) : it;
    b.addEventListener("click", () => {
      const next = onPick(it);
      [...host.children].forEach((el) => el.classList.toggle("on", el.dataset.v === next));
    });
    host.appendChild(b);
  });
}

function buildSetup() {
  draft = { cabin: SETTINGS.cabin || "", section: SETTINGS.section || "", grade: SETTINGS.grade || "" };
  chipGrid($("setCabin"), CABINS, draft.cabin, null, (c) => (draft.cabin = draft.cabin === c ? "" : c));
  chipGrid($("setGrade"), GRADES, draft.grade, ordinalShort, (g) => (draft.grade = draft.grade === g ? "" : g));
  const seg = $("setSection");
  [...seg.children].forEach((el) => {
    el.classList.toggle("on", el.dataset.v === draft.section);
    el.onclick = () => {
      draft.section = draft.section === el.dataset.v ? "" : el.dataset.v;
      [...seg.children].forEach((s) => s.classList.toggle("on", s.dataset.v === draft.section));
    };
  });
}

function openSetup() {
  buildSetup();
  $("sheetBackdrop").classList.add("open");
  $("setupSheet").classList.add("open");
  document.body.style.overflow = "hidden";
}
function closeSetup() {
  $("setupSheet").classList.remove("open");
  if (!$("editSheet").classList.contains("open")) {
    $("sheetBackdrop").classList.remove("open");
    document.body.style.overflow = "";
  }
}
function saveSetup() {
  SETTINGS.cabin = draft.cabin;
  SETTINGS.section = draft.section;
  SETTINGS.grade = draft.grade;
  SETTINGS.role = "counselor";
  SETTINGS.configured = true;
  const ok = saveSettings();
  closeSetup();
  render();
  toast(ok ? "Saved" : "Saved for this session only");
}
function skipSetup() {
  SETTINGS.configured = true;
  saveSettings();
  closeSetup();
  render();
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
        '<input type="time" data-grp="' + g.key + '" data-id="' + id + '" value="' + TIMES[g.key][id] + '"></div>';
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
  closeEdit();
  toast(ok ? "Times saved" : "Saved for this session only");
}
function resetTimes() {
  TIMES = deepDefaults();
  try { localStorage.removeItem(STORAGE_KEY); } catch (e) { /* ignore */ }
  buildEdit();
  render();
  toast("Reset to camp defaults");
}
function openEdit() {
  buildEdit();
  $("sheetBackdrop").classList.add("open");
  $("editSheet").classList.add("open");
  document.body.style.overflow = "hidden";
}
function closeEdit() {
  $("editSheet").classList.remove("open");
  if (!$("setupSheet").classList.contains("open")) {
    $("sheetBackdrop").classList.remove("open");
    document.body.style.overflow = "";
  }
}

/* --------------------------------- UI glue ----------------------------- */
let toastTimer = null;
function toast(msg) {
  const t = $("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
}

function jumpToNow() {
  const row = $("curRow") || $("nowCard");
  if (row) row.scrollIntoView({ behavior: "smooth", block: "center" });
}

function wire() {
  ["now", "week", "mine", "info"].forEach((t) => {
    $("tab-" + t).addEventListener("click", () => setTab(t));
  });

  $("whoPill").addEventListener("click", openSetup);
  $("openEdit").addEventListener("click", openEdit);
  $("bannerEdit").addEventListener("click", openEdit);
  $("sheetClose").addEventListener("click", closeEdit);
  $("saveBtn").addEventListener("click", saveTimes);
  $("resetBtn").addEventListener("click", resetTimes);

  $("setupSave").addEventListener("click", saveSetup);
  $("setupSkip").addEventListener("click", skipSetup);
  $("setupClose").addEventListener("click", closeSetup);

  $("sheetBackdrop").addEventListener("click", () => { closeEdit(); closeSetup(); });
  $("fab").addEventListener("click", jumpToNow);
  $("bannerClose").addEventListener("click", () => {
    $("banner").style.display = "none";
    try { localStorage.setItem("ctcc_banner_hidden", "1"); } catch (e) { /* ignore */ }
  });

  document.addEventListener("keydown", (e) => { if (e.key === "Escape") { closeEdit(); closeSetup(); } });
  document.addEventListener("visibilitychange", () => { if (!document.hidden) render(); });
}

function init() {
  try {
    if (localStorage.getItem("ctcc_banner_hidden") === "1") $("banner").style.display = "none";
  } catch (e) { /* ignore */ }
  wire();
  setTab("now");
  setInterval(tick, 1000);

  if (!SETTINGS.configured) openSetup();

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js").catch(() => { /* offline still works from cache */ });
    });
  }
}

init();
