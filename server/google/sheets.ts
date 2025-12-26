import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

const auth = new JWT({
    
  email: process.env.GOOGLE_CLIENT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

export const doc = new GoogleSpreadsheet(
  process.env.GOOGLE_SHEET_ID!,
  auth
);

export async function initSheet() {
  await doc.loadInfo();
  console.log('✅ Google Sheet connected:', doc.title);
}
