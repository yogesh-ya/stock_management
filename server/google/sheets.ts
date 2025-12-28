import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";

const auth = new JWT({
  email: process.env.GOOGLE_CLIENT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

export const doc = new GoogleSpreadsheet(
  process.env.GOOGLE_SHEET_ID!,
  auth
);

// 🔑 lifecycle guard
let isDocLoaded = false;
let loadingPromise: Promise<void> | null = null;

export async function initSheet() {
  // already loaded → fast exit
  if (isDocLoaded) return;

  // prevent concurrent loadInfo calls
  if (!loadingPromise) {
    loadingPromise = (async () => {
      await doc.loadInfo();
      isDocLoaded = true;
      console.log("✅ Google Sheet connected:", doc.title);
    })();
  }

  await loadingPromise;
}
