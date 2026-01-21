'use client';

import { useMutation } from '@tanstack/react-query';

const STALE_TIME = 5 * 60 * 1000; // 5 minutes

export const useLoginWithEmail = () =>
    useMutation<{ success: boolean; message: string }, Error, { email: string }>({
        mutationFn: async ({ email }) => {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to login');
            }

            return response.json();
        },
    });

export const useLoginWithGoogle = () =>
    useMutation<{ success: boolean; url: string }, Error>({
        mutationFn: async () => {
            const response = await fetch('/api/login/google', {
                method: 'POST',
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to login with Google');
            }

            return response.json();
        },
    });

export const useLogoutUser = () =>
    useMutation<{ success: boolean; message: string }, Error>({
        mutationFn: async () => {
            const response = await fetch('/api/logout', {
                method: 'POST',
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to logout');
            }

            return response.json();
        },
    });
