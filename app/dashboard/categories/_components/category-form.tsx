'use client';

import * as React from 'react';
import { useForm } from '@tanstack/react-form';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateCategory, useUpdateCategory } from '@/lib/api/categories.api';
import { useUser } from '@/components/providers/user-provider';
import { AddCategorySchema, EditCategorySchema } from '@/types/categories.types';
import type { CategoryWithTransactionCount, EditCategoryInput } from '@/types/categories.types';
import { toast } from 'sonner';
import { CategoryIcon } from '@/components/shared/category-icon';
import type { TransactionType, CategoryScope } from '@/lib/prisma/generated/client';

interface CategoryFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    category?: CategoryWithTransactionCount | null;
}

// Common category icons
const CATEGORY_ICONS = [
    'Wallet',
    'CreditCard',
    'Banknote',
    'ShoppingCart',
    'ShoppingBag',
    'Home',
    'Car',
    'Plane',
    'Coffee',
    'Utensils',
    'Pizza',
    'Heart',
    'Stethoscope',
    'GraduationCap',
    'Briefcase',
    'DollarSign',
    'TrendingUp',
    'TrendingDown',
    'Gift',
    'Smartphone',
    'Laptop',
    'Music',
    'Film',
    'Gamepad',
    'Dumbbell',
    'Shirt',
    'Zap',
    'Droplet',
    'Leaf',
    'Sparkles',
];

export function CategoryForm({ open, onOpenChange, category }: CategoryFormProps) {
    const { userId } = useUser();
    const createMutation = useCreateCategory();
    const updateMutation = useUpdateCategory();

    const isEditing = !!category;

    const form = useForm({
        defaultValues: {
            name: category?.name || '',
            icon: category?.icon || 'Wallet',
            type: (category?.type || 'EXPENSE') as TransactionType,
        },
        onSubmit: async ({ value }) => {
            if (!userId) {
                toast.error('User not authenticated');
                return;
            }

            // Validate with Zod schema
            const schema = isEditing ? EditCategorySchema : AddCategorySchema;
            const validationData = {
                ...(isEditing ? { id: category.id } : {}),
                scope: 'USER' as CategoryScope,
                ownerId: userId,
                name: value.name,
                icon: value.icon,
                type: value.type,
            };

            const validated = schema.parse(validationData);

            try {
                if (isEditing) {
                    await updateMutation.mutateAsync(validated as EditCategoryInput);
                    toast.success('Category updated successfully');
                } else {
                    await createMutation.mutateAsync(validated);
                    toast.success('Category created successfully');
                }

                onOpenChange(false);
                form.reset();
            } catch (error) {
                toast.error(error instanceof Error ? error.message : 'Failed to save category');
            }
        },
    });

    // Reset form when category changes
    React.useEffect(() => {
        if (category) {
            form.reset();
        }
    }, [category, form]);

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-135 overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>{isEditing ? 'Edit Category' : 'Add Category'}</SheetTitle>
                    <SheetDescription>{isEditing ? 'Update the category details below.' : 'Fill in the details to create a new category.'}</SheetDescription>
                </SheetHeader>

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        form.handleSubmit();
                    }}
                    className="space-y-6 mt-6 px-4"
                >
                    {/* Category Name */}
                    <form.Field name="name">
                        {(field) => {
                            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

                            return (
                                <Field data-invalid={isInvalid}>
                                    <FieldLabel htmlFor={field.name}>Category Name</FieldLabel>
                                    <Input
                                        id={field.name}
                                        value={field.state.value}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        onBlur={field.handleBlur}
                                        placeholder="e.g., Groceries"
                                        maxLength={100}
                                    />
                                    {isInvalid && <FieldError>{field.state.meta.errors.join(', ')}</FieldError>}
                                </Field>
                            );
                        }}
                    </form.Field>

                    {/* Icon Selection */}
                    <form.Field name="icon">
                        {(field) => {
                            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

                            return (
                                <Field data-invalid={isInvalid}>
                                    <FieldLabel htmlFor={field.name}>Icon</FieldLabel>
                                    <Select value={field.state.value} onValueChange={(value) => field.handleChange(value)}>
                                        <SelectTrigger>
                                            <SelectValue>
                                                <div className="flex items-center gap-2">
                                                    <CategoryIcon name={field.state.value} size={20} />
                                                    <span>{field.state.value}</span>
                                                </div>
                                            </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent className="max-h-75">
                                            {CATEGORY_ICONS.map((iconName) => (
                                                <SelectItem key={iconName} value={iconName}>
                                                    <div className="flex items-center gap-2">
                                                        <CategoryIcon name={iconName} size={20} />
                                                        <span>{iconName}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {isInvalid && <FieldError>{field.state.meta.errors.join(', ')}</FieldError>}
                                </Field>
                            );
                        }}
                    </form.Field>

                    {/* Type Selection */}
                    <form.Field name="type">
                        {(field) => {
                            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

                            return (
                                <Field data-invalid={isInvalid}>
                                    <FieldLabel htmlFor={field.name}>Type</FieldLabel>
                                    <Select value={field.state.value} onValueChange={(value) => field.handleChange(value as TransactionType)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="INCOME">Income</SelectItem>
                                            <SelectItem value="EXPENSE">Expense</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {isInvalid && <FieldError>{field.state.meta.errors.join(', ')}</FieldError>}
                                </Field>
                            );
                        }}
                    </form.Field>

                    {/* Form Actions */}
                    <div className="flex gap-3 pt-4">
                        <Button type="submit" className="flex-1" disabled={createMutation.isPending || updateMutation.isPending}>
                            {createMutation.isPending || updateMutation.isPending ? 'Saving...' : isEditing ? 'Update Category' : 'Create Category'}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                            Cancel
                        </Button>
                    </div>
                </form>
            </SheetContent>
        </Sheet>
    );
}
