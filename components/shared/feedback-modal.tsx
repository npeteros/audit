'use client';

import { useEffect, useState } from 'react';
import { useSubmitFeedback } from '@/lib/api/feedback.api';
import { createClient } from '@/lib/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { EmotionRating } from '@/types/feedback.types';

const STORAGE_KEY = 'feedback_last_submission';
const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
// const FIVE_MINUTES_MS = 5 * 60 * 1000; // 5 minutes in milliseconds
const FIVE_MINUTES_MS = 15 * 1000; // 15 seconds in milliseconds for testing

export default function FeedbackModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [userEmail, setUserEmail] = useState('');
    const [email, setEmail] = useState('');
    const [rating, setRating] = useState<string>('');
    const [npsRating, setNpsRating] = useState<string>('');
    const [message, setMessage] = useState('');
    const [userId, setUserId] = useState<string>('');

    const submitFeedbackMutation = useSubmitFeedback();

    // Get user session and prefill email
    useEffect(() => {
        const fetchUserSession = async () => {
            const supabase = createClient();
            const {
                data: { session },
            } = await supabase.auth.getSession();

            if (session?.user) {
                const userEmail = session.user.email || '';
                setUserEmail(userEmail);
                setEmail(userEmail);
                setUserId(session.user.id);
            }
        };

        fetchUserSession();
    }, []);

    // Timer logic: Check if 24 hours have passed, then start 5-minute timer
    useEffect(() => {
        const checkAndStartTimer = () => {
            const lastSubmission = localStorage.getItem(STORAGE_KEY);
            const now = Date.now();

            console.log('Last submission timestamp:', lastSubmission);

            if (lastSubmission) {
                const lastSubmissionTime = parseInt(lastSubmission, 10);
                const timeSinceLastSubmission = now - lastSubmissionTime;

                // If less than 24 hours have passed, don't show the modal
                // commented out to allow testing
                // if (timeSinceLastSubmission < TWENTY_FOUR_HOURS_MS) {
                //     return;
                // }
            }

            // Start 5-minute timer
            const timer = setTimeout(() => {
                setIsOpen(true);
            }, FIVE_MINUTES_MS);

            return () => clearTimeout(timer);
        };

        const cleanup = checkAndStartTimer();
        return cleanup;
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!rating || !npsRating || !message.trim()) {
            return;
        }

        await submitFeedbackMutation.mutateAsync({
            userId: userId || undefined,
            email: email || undefined,
            rating: rating as EmotionRating,
            npsRating: parseInt(npsRating, 10),
            message: message.trim(),
        });

        // Update localStorage with current timestamp
        localStorage.setItem(STORAGE_KEY, Date.now().toString());

        // Close the modal
        setIsOpen(false);

        // Reset form
        setRating('');
        setNpsRating('');
        setMessage('');
        setEmail(userEmail);
    };

    const handleDismiss = () => {
        // Count dismissal as submission - update localStorage
        localStorage.setItem(STORAGE_KEY, Date.now().toString());
        setIsOpen(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleDismiss}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-lg sm:text-xl">We&apos;d Love Your Feedback!</DialogTitle>
                    <DialogDescription className="text-sm">Help us improve your experience. Share your thoughts and let us know how we&apos;re doing.</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 mt-2 sm:mt-4">
                    <div className="space-y-2">
                        <Label className="text-sm sm:text-base">
                            How do you feel about your experience? <span className="text-red-500">*</span>
                        </Label>
                        <div className="flex justify-between items-start gap-1 sm:gap-2 py-2">
                            {[
                                { value: EmotionRating.TERRIBLE, emoji: '😭', label: 'Terrible', color: 'hover:grayscale-0' },
                                { value: EmotionRating.BAD, emoji: '😞', label: 'Bad', color: 'hover:grayscale-0' },
                                { value: EmotionRating.OKAY, emoji: '😐', label: 'Okay', color: 'hover:grayscale-0' },
                                { value: EmotionRating.GOOD, emoji: '😊', label: 'Good', color: 'hover:grayscale-0' },
                                { value: EmotionRating.AMAZING, emoji: '🤩', label: 'Amazing', color: 'hover:grayscale-0' },
                            ].map((emotion) => (
                                <button
                                    key={emotion.value}
                                    type="button"
                                    onClick={() => setRating(emotion.value)}
                                    className={`flex flex-col items-center gap-0.5 sm:gap-1 p-1 sm:p-2 rounded-lg transition-all ${
                                        rating === emotion.value ? 'bg-primary/10 scale-110' : 'hover:bg-accent hover:scale-105'
                                    }`}
                                >
                                    <span className="text-[10px] sm:text-xs font-medium text-muted-foreground mb-0.5 sm:mb-1 text-center leading-tight">{emotion.label}</span>
                                    <span className={`text-2xl sm:text-4xl transition-all ${rating === emotion.value ? 'grayscale-0' : 'grayscale hover:grayscale-0'}`}>
                                        {emotion.emoji}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm sm:text-base">
                            How likely would you recommend this app to family and friends? <span className="text-red-500">*</span>
                        </Label>
                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-center gap-0.5 sm:gap-1">
                                {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => {
                                    const getHoverColor = (n: number) => {
                                        if (n <= 6) return 'hover:bg-red-500/20 hover:text-red-700 dark:hover:text-red-400';
                                        if (n <= 8) return 'hover:bg-yellow-500/20 hover:text-yellow-700 dark:hover:text-yellow-400';
                                        return 'hover:bg-green-500/20 hover:text-green-700 dark:hover:text-green-400';
                                    };

                                    const getSelectedColor = (n: number) => {
                                        if (n <= 6) return 'bg-red-500 text-white';
                                        if (n <= 8) return 'bg-yellow-500 text-white';
                                        return 'bg-green-500 text-white';
                                    };

                                    return (
                                        <button
                                            key={num}
                                            type="button"
                                            onClick={() => setNpsRating(num.toString())}
                                            className={`flex items-center justify-center w-7 h-7 sm:w-10 sm:h-10 rounded-md sm:rounded-lg text-xs sm:text-base font-semibold transition-all ${
                                                npsRating === num.toString()
                                                    ? `${getSelectedColor(num)} scale-110 shadow-md`
                                                    : `bg-muted text-muted-foreground grayscale hover:grayscale-0 ${getHoverColor(num)} hover:scale-105`
                                            }`}
                                        >
                                            {num}
                                        </button>
                                    );
                                })}
                            </div>
                            <div className="flex justify-between text-[10px] sm:text-xs text-muted-foreground px-1">
                                <span>Not likely</span>
                                <span>Very likely</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="message" className="text-sm sm:text-base">
                            Comments/Suggestions <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                            id="message"
                            placeholder="Tell us what you think..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            required
                            rows={4}
                            maxLength={1000}
                            className="resize-none text-sm sm:text-base"
                        />
                        <p className="text-xs text-muted-foreground text-right">{message.length}/1000</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm sm:text-base">
                            Email (optional)
                        </Label>
                        <Input id="email" type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="text-sm sm:text-base" />
                        <p className="text-xs text-muted-foreground">Leave your email if you&apos;d like us to follow up</p>
                    </div>

                    <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2 sm:pt-4">
                        <Button type="button" variant="outline" onClick={handleDismiss} className="w-full sm:w-auto">
                            Maybe Later
                        </Button>
                        <Button type="submit" disabled={!rating || !message.trim() || submitFeedbackMutation.isPending} className="w-full sm:w-auto">
                            {submitFeedbackMutation.isPending ? 'Submitting...' : 'Submit Feedback'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
