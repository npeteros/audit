'use client';

import * as React from 'react';
import { useForm } from '@tanstack/react-form';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useCreateTransaction, useUpdateTransaction } from '@/lib/api/transactions.api';
import { useCategories } from '@/lib/api/categories.api';
import { useWallets } from '@/lib/api/wallets.api';
import { useUser } from '@/lib/api/users.api';
import { AddTransactionSchema, EditTransactionSchema } from '@/types/transactions.types';
import type { TransactionWithDetailsResponse, EditTransactionInput } from '@/types/transactions.types';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TransactionType } from '@/lib/prisma/generated/client';

interface TransactionFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    transaction?: TransactionWithDetailsResponse | null;
    defaultDate?: Date;
}

export function TransactionForm({ open, onOpenChange, transaction, defaultDate }: TransactionFormProps) {
    const { data: userData } = useUser();
    const { id: userId } = userData?.user || {};
    const createMutation = useCreateTransaction();
    const updateMutation = useUpdateTransaction();

    const [transactionType, setTransactionType] = React.useState<TransactionType>(transaction?.category.type || 'EXPENSE');

    // Fetch categories and wallets
    const { data: allCategories } = useCategories({ userId: userId || undefined });
    const { data: walletsData } = useWallets(userId || undefined);
    const wallets = walletsData?.data || [];

    // Filter categories by transaction type
    const categories = allCategories?.filter((cat) => cat.type === transactionType);

    const isEditing = !!transaction;

    const form = useForm({
        defaultValues: {
            walletId: transaction?.walletId || '',
            categoryId: transaction?.categoryId || '',
            transactionDate: transaction?.transactionDate ? new Date(transaction.transactionDate) : defaultDate || new Date(),
            description: transaction?.description || '',
            amount: transaction ? Number(transaction.amount) : 0,
        },
        onSubmit: async ({ value }) => {
            if (!userId) {
                toast.error('User not authenticated');
                return;
            }

            // Validate with Zod schema
            const schema = isEditing ? EditTransactionSchema : AddTransactionSchema;
            const validationData = {
                ...(isEditing ? { id: transaction.id } : {}),
                userId,
                walletId: value.walletId,
                categoryId: value.categoryId,
                transactionDate: value.transactionDate,
                description: value.description || undefined,
                amount: value.amount,
            };

            const validated = schema.parse(validationData);

            try {
                if (isEditing) {
                    await updateMutation.mutateAsync(validated as EditTransactionInput);
                    toast.success('Transaction updated successfully');
                } else {
                    await createMutation.mutateAsync(validated);
                    toast.success('Transaction created successfully');
                }

                onOpenChange(false);
                form.reset();
            } catch (error) {
                toast.error(error instanceof Error ? error.message : 'Failed to save transaction');
            }
        },
    });

    // Reset form when transaction changes
    React.useEffect(() => {
        if (transaction) {
            setTransactionType(transaction.category.type);
            form.reset();
        }
    }, [transaction, form]);

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-135 overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>{isEditing ? 'Edit Transaction' : 'Add Transaction'}</SheetTitle>
                    <SheetDescription>{isEditing ? 'Update the transaction details below.' : 'Fill in the details to create a new transaction.'}</SheetDescription>
                </SheetHeader>

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        form.handleSubmit();
                    }}
                    className="space-y-6 mt-6 px-4"
                >
                    {/* Transaction Type Toggle */}
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant={transactionType === 'INCOME' ? 'default' : 'outline'}
                            className="flex-1"
                            onClick={() => {
                                setTransactionType('INCOME');
                                form.setFieldValue('categoryId', '');
                            }}
                        >
                            Income
                        </Button>
                        <Button
                            type="button"
                            variant={transactionType === 'EXPENSE' ? 'default' : 'outline'}
                            className="flex-1"
                            onClick={() => {
                                setTransactionType('EXPENSE');
                                form.setFieldValue('categoryId', '');
                            }}
                        >
                            Expense
                        </Button>
                    </div>

                    {/* Wallet Selection */}
                    <form.Field name="walletId">
                        {(field) => {
                            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

                            return (
                                <Field data-invalid={isInvalid}>
                                    <FieldLabel htmlFor={field.name}>Wallet</FieldLabel>
                                    <Select value={field.state.value} onValueChange={(value) => field.handleChange(value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a wallet" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {wallets?.map((wallet) => (
                                                <SelectItem key={wallet.id} value={wallet.id}>
                                                    {wallet.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                </Field>
                            );
                        }}
                    </form.Field>

                    {/* Category Selection */}
                    <form.Field name="categoryId">
                        {(field) => {
                            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

                            return (
                                <Field data-invalid={isInvalid}>
                                    <FieldLabel htmlFor={field.name}>Category</FieldLabel>
                                    <Select value={field.state.value} onValueChange={(value) => field.handleChange(value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories?.map((category) => (
                                                <SelectItem key={category.id} value={category.id}>
                                                    {category.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                </Field>
                            );
                        }}
                    </form.Field>

                    {/* Transaction Date */}
                    <form.Field name="transactionDate">
                        {(field) => {
                            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

                            return (
                                <Field data-invalid={isInvalid}>
                                    <FieldLabel htmlFor={field.name}>Date</FieldLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className={cn('w-full justify-start text-left font-normal', !field.state.value && 'text-muted-foreground')}>
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {field.state.value ? format(field.state.value, 'PPP') : <span>Pick a date</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar mode="single" selected={field.state.value} onSelect={(date) => field.handleChange(date || new Date())} initialFocus />
                                        </PopoverContent>
                                    </Popover>
                                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                </Field>
                            );
                        }}
                    </form.Field>

                    {/* Amount */}
                    <form.Field name="amount">
                        {(field) => {
                            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

                            return (
                                <Field data-invalid={isInvalid}>
                                    <FieldLabel htmlFor={field.name}>Amount</FieldLabel>
                                    <Input
                                        id={field.name}
                                        name={field.name}
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        placeholder="0.00"
                                        value={field.state.value || ''}
                                        onBlur={field.handleBlur}
                                        onChange={(e) => field.handleChange(parseFloat(e.target.value) || 0)}
                                    />
                                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                </Field>
                            );
                        }}
                    </form.Field>

                    {/* Description */}
                    <form.Field name="description">
                        {(field) => {
                            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

                            return (
                                <Field data-invalid={isInvalid}>
                                    <FieldLabel htmlFor={field.name}>Description (Optional)</FieldLabel>
                                    <Input
                                        id={field.name}
                                        name={field.name}
                                        placeholder="Enter description"
                                        value={field.state.value}
                                        onBlur={field.handleBlur}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                    />
                                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
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
