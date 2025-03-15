import CategoryService, { CategoryFilters } from "@/services/categories.service";
import { AddCategorySchema, EditCategorySchema, DeleteCategorySchema } from "@/types/categories.types";
import { TransactionType } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const categoryService = new CategoryService;
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const filters: CategoryFilters = {};

        searchParams.forEach((value, key) => {
            if (key === "id" || key === "walletId") {
                filters[key] = Number(value);
            }
            if (key === "userId") {
                filters[key] = value;
            }

            if (key === "type") {
                filters[key] = value as TransactionType;
            }
        });

        const categories = await categoryService.getCategories({ filters });
        return NextResponse.json({ categories }, { status: 200 });
    } catch (error) {
        console.error('Error fetching categories:', error);
        return NextResponse.json({ error: `${error}` }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const result = AddCategorySchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json({ error: result.error.errors }, { status: 400 });
        }

        const validatedBody = result.data;
        const newCategory = await categoryService.addCategory(validatedBody);
        return NextResponse.json({ newCategory }, { status: 201 });
    } catch (error) {
        console.error('Error adding category:', error);
        return NextResponse.json({ error: `${error}` }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const body = await req.json();
        const result = EditCategorySchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json({ error: result.error.errors }, { status: 400 });
        }

        const validatedBody = result.data;
        const updatedCategory = await categoryService.editCategory(validatedBody);
        return NextResponse.json({ updatedCategory }, { status: 200 });
    } catch (error) {
        console.error('Error updating category:', error);
        return NextResponse.json({ error: `${error}` }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const body = await req.json();
        const result = DeleteCategorySchema.safeParse(body)

        if (!result.success) {
            return NextResponse.json({ error: result.error.errors }, { status: 400 });
        }

        const validatedBody = result.data;
        const deletedCategory = await categoryService.deleteCategory(validatedBody);
        return NextResponse.json({ deletedCategory }, { status: 200 });
    } catch (error) {
        console.error('Error deleting category:', error);
        return NextResponse.json({ error: 'An unexpected error occurred while deleting the category.' }, { status: 500 });
    }
}