import { google } from 'googleapis';

export function createSheetsClient() {
    const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
    const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY;

    if (!clientEmail || !privateKey) {
        throw new Error('Missing required Google Sheets environment variables: GOOGLE_SHEETS_CLIENT_EMAIL and GOOGLE_SHEETS_PRIVATE_KEY');
    }

    const auth = new google.auth.GoogleAuth({
        credentials: {
            client_email: clientEmail,
            private_key: privateKey.replace(/\\n/g, '\n'),
        },
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    return google.sheets({ version: 'v4', auth });
}

export function getSpreadsheetId(): string {
    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;

    if (!spreadsheetId) {
        throw new Error('Missing required Google Sheets environment variable: GOOGLE_SHEETS_SPREADSHEET_ID');
    }

    return spreadsheetId;
}
