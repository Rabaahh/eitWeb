# eitWeb

A small shared workout tracker for two people. It uses plain HTML, CSS, and browser JavaScript modules, with Firebase Authentication and Cloud Firestore. There is no build step and no public sign-up form.

## Project files

- `index.html` — signed-in dashboard with both summaries and monthly calendars.
- `login.html` — email and password sign-in only.
- `css/style.css` — responsive light and dark themes.
- `js/firebase.js` — Firebase web config and the two account UIDs.
- `js/auth.js` — sign-in, sign-out, and auth state helpers.
- `js/workouts.js` — Firestore access and local-date/streak/month logic.
- `js/ui.js` — calendar and dashboard rendering, plus theme preference.
- `js/app.js` and `js/login.js` — page startup and interaction handlers.
- `firestore.rules` — the database access rules to paste into Firebase.

## 1. Create and configure Firebase

1. Open [Firebase Console](https://console.firebase.google.com/) and choose **Create a project**. Name it `eitWeb`. Google Analytics is not needed for this app, so you can leave it off.
2. Keep the project on the **Spark (no-cost)** plan. Do not link a Cloud Billing account. Spark has daily free Firestore quotas; if a quota is exceeded, Firebase pauses that product until the quota resets rather than charging the project. The app uses only a couple of accounts and a small amount of data. See [Firebase pricing plans](https://firebase.google.com/docs/projects/billing/firebase-pricing-plans) and [Firestore free quota](https://firebase.google.com/docs/firestore/pricing).
3. In the project overview, add a **Web app** (the `</>` icon). Give it the name `eitWeb`; do not enable Firebase Hosting. Copy the displayed `firebaseConfig` values.
4. Open **Authentication → Get started → Sign-in method**. Enable **Email/Password** and save. Do not add any other sign-in provider.
5. In **Authentication → Users**, choose **Add user** and create the two accounts with their email addresses and passwords. There is no in-app account creation screen.
6. The account UIDs have already been added to `js/firebase.js` and `firestore.rules`. The account order determines the permanent **ME** and **HER** labels.
7. In **Firestore Database**, choose **Create database**. Select **Start in production mode**, then choose a location near you. The free Spark plan includes one free Firestore database per project.
8. In Firestore **Data**, create a collection named `users`. Add one document per account, using that account’s Auth UID as the document ID. Each document should contain one field: `name` (string), for example `{ name: "Alex" }` and `{ name: "Sam" }`.
9. Open the Firestore **Rules** tab, replace its contents with all of `firestore.rules` from this project, and click **Publish**. The rules let only those two accounts read the profiles and shared workouts. A person can create or delete only their own daily workout record; updates and all other writes are denied.
10. In `js/firebase.js`, replace the sample values in `firebaseConfig` with the values from step 3. Keep the config inside the braces and save the file. The web config is public by design; Firestore rules and Authentication protect the data.

The `workouts` collection is created automatically the first time someone marks a workout. Each document ID is `UID_YYYY-MM-DD` and each document contains `{ uid, date, done: true }`. The date is generated from the person’s local browser date.

## 2. Preview locally

Because the project uses JavaScript modules, open it through a local web server rather than opening `index.html` as a `file:` URL. One free option is the VS Code **Live Server** extension: open this folder, right-click `login.html`, then choose **Open with Live Server**. For Firebase projects created after April 28, 2025, first add `localhost` under **Authentication → Settings → Authorized domains** to allow local sign-in. Remove it again after local preview if you want only the production site authorized. Then sign in with either of the two accounts.

## 3. Publish for free with GitHub Pages

1. Create a **public** GitHub repository named `eitWeb` (GitHub Pages is included with GitHub Free for public repositories). Do not commit passwords or other private credentials; the Firebase web config and UIDs are public client values.
2. Upload all project files and folders to the repository’s root. Include `.nojekyll` if present; there is no build step.
3. In the repository, open **Settings → Pages**. Under **Build and deployment**, choose **Deploy from a branch**, select `main` and `/(root)`, then save.
4. Wait for the Pages deployment to finish. Your site URL will be `https://rabaahh.github.io/eitWeb/`.
5. In Firebase Console, open **Authentication → Settings → Authorized domains** and add the host `rabaahh.github.io` (without `https://` or the repository path). This allows Firebase Authentication to work on the Pages site.
6. Visit the site URL and sign in. The dashboard loads after Firebase config, both account UIDs, profiles, and rules are in place.

GitHub Pages serves static files for free from a public repository; Firebase Spark and GitHub Pages both have service limits. This app has no server, paid API, or build service. See [GitHub’s Pages guide](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site).

## Adding a feature later

Add the new behavior to the relevant small module: Firestore work in `js/workouts.js`, rendering in `js/ui.js`, or page interactions in `js/app.js`/`js/login.js`. If it needs new data access, update and publish `firestore.rules` before relying on it. Keep the Firebase config and the no-build static structure intact.
