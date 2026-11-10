// Sign-in screen. Accounts must be created in Firebase Console by the owner.
import { observeAuth, signIn, friendlyAuthError } from "./auth.js";
import { initializeTheme } from "./ui.js";

const form = document.getElementById("login-form");
const submitButton = document.getElementById("login-submit");
const notice = document.getElementById("login-notice");

initializeTheme(document.getElementById("theme-toggle"));

observeAuth((user) => {
  if (user) window.location.replace("index.html");
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  notice.hidden = true;
  submitButton.disabled = true;
  submitButton.querySelector("span:first-child").textContent = "Signing in…";

  const email = form.elements.email.value.trim();
  const password = form.elements.password.value;

  try {
    await signIn(email, password);
    window.location.replace("index.html");
  } catch (error) {
    notice.textContent = friendlyAuthError(error);
    notice.hidden = false;
    submitButton.disabled = false;
    submitButton.querySelector("span:first-child").textContent = "Sign in";
  }
});
