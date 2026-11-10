// Dashboard startup, authorization checks, and click handling.
import { observeAuth, signOutUser, friendlyAuthError } from "./auth.js";
import { auth, people as configuredPeople } from "./firebase.js";
import { loadPeople, localDateKey, markWorkout, undoWorkout, watchWorkouts } from "./workouts.js";
import { changeMonth, initializeTheme, renderDashboard, showSetupError } from "./ui.js";

const cards = document.getElementById("people-grid");
const signOutButton = document.getElementById("sign-out");
const months = {};
let currentUser = null;
let profiles = [];
let records = [];
let busyUid = null;
let notice = "";
let stopWatching = null;

initializeTheme(document.getElementById("theme-toggle"));

signOutButton.addEventListener("click", async () => {
  signOutButton.disabled = true;
  try {
    await signOutUser();
  } catch (error) {
    setNotice(friendlyAuthError(error));
    signOutButton.disabled = false;
  }
});

cards.addEventListener("click", async (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button || !currentUser) return;

  if (button.dataset.action === "month") {
    const person = profiles.find((item) => item.uid === button.dataset.uid);
    if (!person) return;
    const month = months[person.uid] || new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    months[person.uid] = changeMonth(month, Number(button.dataset.delta));
    render();
    return;
  }

  if (button.dataset.action === "toggle") await toggleToday(button.dataset.uid);
});

observeAuth(async (user) => {
  if (!user) {
    window.location.replace("login.html");
    return;
  }

  currentUser = user;
  document.getElementById("signed-in-as").textContent = user.email || "Signed in";
  if (stopWatching) stopWatching();

  try {
    profiles = await loadPeople();
    if (!profiles.some((person) => person.uid === user.uid)) {
      throw new Error("This account is not one of the two configured accounts. Check both UIDs in js/firebase.js.");
    }
    profiles.forEach((person) => {
      months[person.uid] = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    });
    document.getElementById("loading-state")?.remove();
    render();
    stopWatching = watchWorkouts(
      [configuredPeople.meUid, configuredPeople.herUid],
      (nextRecords) => { records = nextRecords; render(); },
      (error) => setNotice(`Couldn’t load workouts: ${friendlyAuthError(error)}`),
    );
  } catch (error) {
    showSetupError(error.message || friendlyAuthError(error));
  }
});

function render() {
  if (!profiles.length || !currentUser) return;
  renderDashboard({ container: cards, people: profiles, records, currentUid: currentUser.uid, months, busyUid, notice });
}

function setNotice(message) {
  notice = message;
  render();
  if (!profiles.length) showSetupError(message);
}

async function toggleToday(uid) {
  if (uid !== currentUser.uid || busyUid) return;
  const date = localDateKey();
  const isDone = records.some((record) => record.uid === uid && record.date === date && record.done);
  busyUid = uid;
  notice = "";
  render();

  try {
    if (isDone) {
      await undoWorkout(uid, date);
      records = records.filter((record) => !(record.uid === uid && record.date === date));
    } else {
      await markWorkout(uid, date);
      records = [...records.filter((record) => !(record.uid === uid && record.date === date)), { uid, date, done: true }];
    }
  } catch (error) {
    notice = `Couldn’t save today’s workout: ${friendlyAuthError(error)}`;
  } finally {
    busyUid = null;
    render();
  }
}
