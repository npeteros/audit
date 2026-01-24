import { createSheetsClient, getSpreadsheetId } from '@/lib/google-sheets/client';
import type { FeedbackInput } from '@/types/feedback.types';

class FeedbackService {
    async submitFeedback(data: FeedbackInput): Promise<void> {
        try {
            const sheets = createSheetsClient();
            const spreadsheetId = getSpreadsheetId();

            const timestamp = new Date().toISOString();
            const rowData = [timestamp, data.userId || 'Anonymous', data.email || 'Not provided', data.rating.toString(), data.npsRating.toString(), data.message];

            await sheets.spreadsheets.values.append({
                spreadsheetId,
                range: 'Feedback!A:F',
                valueInputOption: 'RAW',
                requestBody: {
                    values: [rowData],
                },
            });

            console.log('Feedback submitted successfully:', {
                timestamp,
                userId: data.userId,
                rating: data.rating,
            });
        } catch (error) {
            console.error('Error submitting feedback to Google Sheets:', error);
            throw new Error('Failed to submit feedback to Google Sheets');
        }
    }
}

export const feedbackService = new FeedbackService();
