// DOM rendering, theme preference, and small formatting helpers.
import { countMonth, currentStreak, localDateKey, monthKey } from "./workouts.js";

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function initializeTheme(button) {
  const saved = localStorage.getItem("eitWeb-theme");
  const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
  setTheme(saved || (prefersDark ? "dark" : "light"), button);
  button.addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    setTheme(next, button);
  });
}

function setTheme(theme, button) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem("eitWeb-theme", theme);
  const isDark = theme === "dark";
  button.setAttribute("aria-label", `Switch to ${isDark ? "light" : "dark"} mode`);
  button.querySelector(".theme-icon").textContent = isDark ? "☀" : "☾";
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]);
}

function calendarMarkup(person, records, monthDate) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const completed = new Set(records.filter((record) => record.done).map((record) => record.date));
  const today = localDateKey();
  const title = new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" }).format(monthDate);
  let cells = weekdays.map((day) => `<span class="weekday" role="columnheader">${day}</span>`).join("");

  for (let blank = 0; blank < firstDay; blank += 1) {
    cells += '<span class="calendar-empty" aria-hidden="true"></span>';
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = localDateKey(new Date(year, month, day));
    const isDone = completed.has(date);
    const classes = ["calendar-day", isDone ? "is-done" : "", date === today ? "is-today" : "", date > today ? "is-future" : ""]
      .filter(Boolean)
      .join(" ");
    const label = `${person.name}, ${new Intl.DateTimeFormat(undefined, { month: "long", day: "numeric", year: "numeric" }).format(new Date(year, month, day))}: ${isDone ? "workout done" : "no workout recorded"}`;
    cells += `<span class="${classes}" role="gridcell" aria-label="${escapeHTML(label)}">${day}</span>`;
  }

  return `
    <section class="calendar-section" aria-label="${escapeHTML(person.name)}'s monthly calendar">
      <div class="calendar-heading">
        <h3>Monthly calendar</h3>
        <div class="month-switcher" aria-label="Choose calendar month">
          <button class="month-button" type="button" data-action="month" data-uid="${person.uid}" data-delta="-1" aria-label="Previous month">‹</button>
          <span class="month-title">${escapeHTML(title)}</span>
          <button class="month-button" type="button" data-action="month" data-uid="${person.uid}" data-delta="1" aria-label="Next month">›</button>
        </div>
      </div>
      <div class="calendar-grid" role="grid" aria-label="${escapeHTML(title)}">${cells}</div>
      <p class="calendar-legend"><span class="legend-swatch" aria-hidden="true"></span> Workout done</p>
    </section>`;
}

function personCard(person, allRecords, currentUid, monthDate, busyUid) {
  const records = allRecords.filter((record) => record.uid === person.uid && record.done);
  const today = localDateKey();
  const doneToday = records.some((record) => record.date === today);
  const isCurrentUser = person.uid === currentUid;
  const roleLabel = person.role === "me" ? "ME" : "HER";
  const statusLabel = doneToday ? "Done today" : "Not yet";
  const streak = currentStreak(records, today);
  const monthTotal = countMonth(records, monthKey());
  const isBusy = busyUid === person.uid;
  const todayButton = isCurrentUser
    ? `<button class="primary-button mark-button ${doneToday ? "is-undo" : ""}" type="button" data-action="toggle" data-uid="${person.uid}" ${isBusy ? "disabled" : ""}>
        <span>${isBusy ? "Saving…" : doneToday ? "Undo today’s mark" : "Mark today as done"}</span><span class="mark-arrow" aria-hidden="true">${doneToday ? "↶" : "→"}</span>
      </button>`
    : '<p class="read-only-note"><span class="lock-mark" aria-hidden="true">⌑</span> Only they can update this card.</p>';

  return `
    <article class="person-card" data-role="${person.role}">
      <div class="person-heading">
        <div class="person-heading-copy">
          <p class="person-label">${roleLabel}</p>
          <h2 class="person-name">${escapeHTML(person.name)}</h2>
        </div>
        <span class="today-pill ${doneToday ? "is-done" : ""}"><span class="pill-dot" aria-hidden="true"></span>${statusLabel}</span>
      </div>
      <div class="metrics">
        <div class="metric"><span class="metric-value">${streak}</span><span class="metric-label">${streak === 1 ? "Day" : "Days"} in a row</span></div>
        <div class="metric"><span class="metric-value">${monthTotal}</span><span class="metric-label">This month</span></div>
      </div>
      ${todayButton}
      ${calendarMarkup(person, records, monthDate)}
    </article>`;
}

export function renderDashboard({ container, people, records, currentUid, months, busyUid, notice }) {
  // Put the signed-in person's card first on desktop and mobile, while each
  // profile keeps its permanent ME or HER identity label.
  const orderedPeople = [...people].sort((first, second) => {
    if (first.uid === currentUid) return -1;
    if (second.uid === currentUid) return 1;
    return 0;
  });

  container.innerHTML = orderedPeople.map((person) => {
    const selectedMonth = months[person.uid] || new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    return personCard(person, records, currentUid, selectedMonth, busyUid);
  }).join("");

  const noticeElement = document.getElementById("dashboard-notice");
  noticeElement.textContent = notice || "";
  noticeElement.hidden = !notice;
}

export function changeMonth(monthDate, delta) {
  return new Date(monthDate.getFullYear(), monthDate.getMonth() + delta, 1);
}

export function showSetupError(message) {
  const loading = document.getElementById("loading-state");
  if (loading) loading.remove();
  const notice = document.getElementById("dashboard-notice");
  notice.textContent = message;
  notice.hidden = false;
}
