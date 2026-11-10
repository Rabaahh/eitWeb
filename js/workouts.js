// Firestore access and date logic for one person's daily workout records.
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  setDoc,
  where,
} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-firestore.js";
import { db, people } from "./firebase.js";

export function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function monthKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function hasConfiguredPeople() {
  const values = [people.meUid, people.herUid];
  return values.every((uid) => uid && !uid.startsWith("PASTE_") && uid !== "YOUR_UID_HERE") && values[0] !== values[1];
}

export async function loadPeople() {
  if (!hasConfiguredPeople()) {
    throw new Error("Add both account UIDs in js/firebase.js before opening the tracker.");
  }

  const entries = [
    { uid: people.meUid, role: "me" },
    { uid: people.herUid, role: "her" },
  ];
  const snapshots = await Promise.all(entries.map(({ uid }) => getDoc(doc(db, "users", uid))));

  return entries.map((person, index) => {
    const snapshot = snapshots[index];
    const name = snapshot.exists() ? snapshot.data().name : "";
    if (typeof name !== "string" || !name.trim()) {
      throw new Error(`Add a name to the Firestore profile at users/${person.uid}.`);
    }
    return { ...person, name: name.trim() };
  });
}

export function watchWorkouts(uids, onChange, onError) {
  const workoutsQuery = query(collection(db, "workouts"), where("uid", "in", uids));
  return onSnapshot(
    workoutsQuery,
    (snapshot) => onChange(snapshot.docs.map((entry) => entry.data())),
    onError,
  );
}

export async function markWorkout(uid, date = localDateKey()) {
  const id = `${uid}_${date}`;
  await setDoc(doc(db, "workouts", id), { uid, date, done: true });
}

export async function undoWorkout(uid, date = localDateKey()) {
  const id = `${uid}_${date}`;
  await deleteDoc(doc(db, "workouts", id));
}

function previousDateKey(dateKey) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return localDateKey(new Date(year, month - 1, day - 1));
}

// Today's not-yet-completed workout does not break the active streak until
// tomorrow, so an unfinished today starts counting back from yesterday.
export function currentStreak(records, today = localDateKey()) {
  const completed = new Set(records.filter((record) => record.done).map((record) => record.date));
  let cursor = completed.has(today) ? today : previousDateKey(today);
  let streak = 0;

  while (completed.has(cursor)) {
    streak += 1;
    cursor = previousDateKey(cursor);
  }
  return streak;
}

export function countMonth(records, month = monthKey()) {
  return records.reduce((count, record) => count + (record.done && record.date?.startsWith(`${month}-`) ? 1 : 0), 0);
}
