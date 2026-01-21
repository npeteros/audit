'use client';

import * as React from 'react';
import { useForm } from '@tanstack/react-form';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { useCreateWallet, useUpdateWallet } from '@/lib/api/wallets.api';
import { useUser } from '@/components/providers/user-provider';
import { AddWalletSchema, EditWalletSchema } from '@/types/wallets.types';
import type { WalletWithCountResponse, EditWalletInput, AddWalletInput } from '@/types/wallets.types';
import { toast } from 'sonner';

interface WalletFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    wallet?: WalletWithCountResponse | null;
}

export function WalletForm({ open, onOpenChange, wallet }: WalletFormProps) {
    const { userId } = useUser();
    const createMutation = useCreateWallet();
    const updateMutation = useUpdateWallet();

    const isEditing = !!wallet;

    const form = useForm({
        defaultValues: {
            name: wallet?.name || '',
        },
        onSubmit: async ({ value }) => {
            if (!userId) {
                toast.error('User not authenticated');
                return;
            }

            // Validate with Zod schema
            const schema = isEditing ? EditWalletSchema : AddWalletSchema;
            const validationData = {
                ...(isEditing ? { id: wallet.id } : {}),
                userId,
                name: value.name,
            };

            try {
                const validated = schema.parse(validationData);

                if (isEditing) {
                    await updateMutation.mutateAsync(validated as EditWalletInput);
                    toast.success('Wallet updated successfully');
                } else {
                    await createMutation.mutateAsync(validated as AddWalletInput);
                    toast.success('Wallet created successfully');
                }

                onOpenChange(false);
                form.reset();
            } catch (error) {
                toast.error(error instanceof Error ? error.message : 'Failed to save wallet');
            }
        },
    });

    // Reset form when wallet changes or dialog closes
    React.useEffect(() => {
        if (wallet) {
            form.setFieldValue('name', wallet.name);
        } else {
            form.reset();
        }
    }, [wallet, form]);

    React.useEffect(() => {
        if (!open) {
            form.reset();
        }
    }, [open, form]);

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-135 overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>{isEditing ? 'Edit Wallet' : 'Add Wallet'}</SheetTitle>
                    <SheetDescription>{isEditing ? 'Update the wallet details below.' : 'Fill in the details to create a new wallet.'}</SheetDescription>
                </SheetHeader>

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        form.handleSubmit();
                    }}
                    className="space-y-6 mt-6 px-4"
                >
                    {/* Wallet Name */}
                    <form.Field
                        name="name"
                        validators={{
                            onChange: ({ value }) => {
                                if (!value || value.trim().length === 0) {
                                    return 'Name is required';
                                }
                                if (value.length > 255) {
                                    return 'Name must not exceed 255 characters';
                                }
                                return undefined;
                            },
                        }}
                    >
                        {(field) => {
                            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

                            return (
                                <Field data-invalid={isInvalid}>
                                    <FieldLabel htmlFor={field.name}>Wallet Name</FieldLabel>
                                    <Input
                                        id={field.name}
                                        name={field.name}
                                        placeholder="e.g., Main Wallet, Savings, Cash"
                                        value={field.state.value}
                                        onBlur={field.handleBlur}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        autoFocus
                                    />
                                    {isInvalid && field.state.meta.errors && <FieldError errors={field.state.meta.errors.map((err) => ({ message: String(err) }))} />}
                                </Field>
                            );
                        }}
                    </form.Field>

                    {/* Form Actions */}
                    <div className="flex gap-3 pt-4">
                        <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" className="flex-1" disabled={createMutation.isPending || updateMutation.isPending}>
                            {createMutation.isPending || updateMutation.isPending ? 'Saving...' : isEditing ? 'Update' : 'Create'}
                        </Button>
                    </div>
                </form>
            </SheetContent>
        </Sheet>
    );
}
