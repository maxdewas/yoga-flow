// Firebase web config. These values identify the project and are public by design;
// access is enforced by firestore.rules. Each reference must stay literal so Next.js inlines it.
export const FIREBASE_CONFIG = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/** Without a config the app stays local-only and hides the Google sign-in button. */
export const firebaseConfigured = Object.values(FIREBASE_CONFIG).every(Boolean);
