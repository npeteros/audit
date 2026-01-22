import { NextRequest, NextResponse } from 'next/server';
import { categoryService } from '@/services/categories.services';
import { AddCategorySchema } from '@/types/categories.types';
import { z } from 'zod';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const scope = searchParams.get('scope');
        const ownerId = searchParams.get('ownerId');
        const type = searchParams.get('type');

        // If ownerId is provided, get categories available for that owner
        if (ownerId) {
            const categories = await categoryService.getCategoriesForUser(ownerId, type === 'INCOME' || type === 'EXPENSE' ? type : undefined);
            return NextResponse.json(categories);
        }

        const categories = await categoryService.getCategories({
            scope: scope === 'GLOBAL' || scope === 'USER' ? scope : undefined,
            ownerId: ownerId || undefined,
            type: type === 'INCOME' || type === 'EXPENSE' ? type : undefined,
        });

        return NextResponse.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validatedData = AddCategorySchema.parse(body);

        // Check if category name already exists for this scope
        const nameExists = await categoryService.categoryNameExists(validatedData.name, validatedData.type, validatedData.scope, validatedData.ownerId);

        if (nameExists) {
            return NextResponse.json({ error: 'Category name already exists for this scope' }, { status: 409 });
        }

        const category = await categoryService.addCategory(validatedData);

        return NextResponse.json(category, { status: 201 });
    } catch (error) {
        if (error instanceof Error && 'issues' in error) {
            return NextResponse.json({ error: 'Validation failed', details: error }, { status: 400 });
        }

        console.error('Error creating category:', error);
        return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate that we have an array of IDs
        const schema = z.object({
            ids: z.array(z.string().uuid()),
        });

        const { ids } = schema.parse(body);

        if (ids.length === 0) {
            return NextResponse.json({ error: 'No category IDs provided' }, { status: 400 });
        }

        // Delete all categories
        const count = await categoryService.bulkDeleteCategories(ids);

        return NextResponse.json({ count }, { status: 200 });
    } catch (error) {
        if (error instanceof Error && 'issues' in error) {
            return NextResponse.json({ error: 'Validation failed', details: error }, { status: 400 });
        }

        console.error('Error deleting categories:', error);
        return NextResponse.json({ error: 'Failed to delete categories' }, { status: 500 });
    }
}
