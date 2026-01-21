import { NextRequest, NextResponse } from 'next/server';
import { categoryService } from '@/services/categories.services';
import { EditCategorySchema, DeleteCategorySchema } from '@/types/categories.types';

export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const category = await categoryService.getCategoryById(params.id);

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json({ error: 'Failed to fetch category' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const body = await request.json();
    const validatedData = EditCategorySchema.parse({ ...body, id: params.id });

    // Check if category exists
    const exists = await categoryService.categoryExists(params.id);
    if (!exists) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    // Check if new name already exists for this scope
    const nameExists = await categoryService.categoryNameExists(
      validatedData.name,
      validatedData.type,
      validatedData.scope,
      validatedData.ownerId,
      params.id
    );

    if (nameExists) {
      return NextResponse.json(
        { error: 'Category name already exists for this scope' },
        { status: 409 }
      );
    }

    const category = await categoryService.editCategory(validatedData);

    return NextResponse.json(category);
  } catch (error) {
    if (error instanceof Error && 'issues' in error) {
      return NextResponse.json({ error: 'Validation failed', details: error }, { status: 400 });
    }

    console.error('Error updating category:', error);
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const validatedData = DeleteCategorySchema.parse({ id: params.id });

    // Check if category exists
    const exists = await categoryService.categoryExists(params.id);
    if (!exists) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    await categoryService.deleteCategory(validatedData);

    return NextResponse.json({ message: 'Category deleted successfully' });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Foreign key constraint')) {
      return NextResponse.json(
        { error: 'Cannot delete category with existing transactions' },
        { status: 409 }
      );
    }

    console.error('Error deleting category:', error);
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}
