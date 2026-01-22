'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { useForm } from '@tanstack/react-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { useLoginWithEmail, useUser } from '@/lib/api/users.api';
import { useRouter } from 'next/navigation';

const emailSchema = z.object({
    email: z.email('Please enter a valid email address').min(1, 'Email is required'),
});

export default function EmailLoginForm({ className, ...props }: React.ComponentPropsWithoutRef<'form'>) {
    const emailLogin = useLoginWithEmail();

    const form = useForm({
        defaultValues: {
            email: '',
        },
        validators: {
            onSubmit: emailSchema,
        },
        onSubmit: async ({ value }) => {
            try {
                await emailLogin.mutateAsync(
                    {
                        email: value.email,
                    },
                    {
                        onSuccess: (data) => {
                            if (data.success) {
                                toast.success(data.message);
                                form.reset();
                            }
                        },
                        onError: (error) => {
                            toast.error(error.message);
                        },
                    }
                );
            } catch (error) {
                toast.error('An unexpected error occurred. Please try again.');
                console.log('Error during sign-in with email:', error);
            }
        },
    });

    const { data: userData } = useUser();
    const { id: userId } = userData?.user || {};
    const router = useRouter();
    if (userId) {
        router.push('/');
        return;
    }

    return (
        <>
            <form
                id="login-form"
                onSubmit={(e) => {
                    e.preventDefault();
                    form.handleSubmit();
                }}
                className={cn('flex flex-col gap-4', className)}
                {...props}
            >
                <form.Field name="email">
                    {(field) => {
                        const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

                        return (
                            <Field data-invalid={isInvalid}>
                                <FieldLabel htmlFor={field.name}>Email Address</FieldLabel>
                                <Input
                                    id={field.name}
                                    name={field.name}
                                    type="email"
                                    placeholder="m@example.com"
                                    value={field.state.value}
                                    onBlur={field.handleBlur}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    aria-invalid={isInvalid}
                                    autoComplete="email"
                                    className="bg-background text-foreground border-input"
                                />
                                {isInvalid && <FieldError errors={field.state.meta.errors} />}
                            </Field>
                        );
                    }}
                </form.Field>

                <form.Subscribe selector={(state) => [state.isSubmitting]}>
                    {([isSubmitting]) => (
                        <Button type="submit" form="login-form" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isSubmitting}>
                            {isSubmitting ? 'Sending...' : 'Continue with Email'}
                        </Button>
                    )}
                </form.Subscribe>
            </form>

            <div className="text-center text-xs text-muted-foreground text-balance [&_a]:underline [&_a]:underline-offset-4 transition-colors">
                By clicking continue, you agree to our{' '}
                <a href="#" className="hover:text-foreground">
                    Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="hover:text-foreground">
                    Privacy Policy
                </a>
                .
            </div>
        </>
    );
}
