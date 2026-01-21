import { Prisma } from '@/lib/prisma/generated/browser';
import { PrismaClient } from '../lib/prisma/generated/client';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
    adapter,
});

const globalCategories: Prisma.CategoryCreateInput[] = [
    {
        name: 'Groceries',
        icon: 'ShoppingCart',
        type: 'EXPENSE',
        scope: 'GLOBAL',
    },
    {
        name: 'Transportation',
        icon: 'Car',
        type: 'EXPENSE',
        scope: 'GLOBAL',
    },
    {
        name: 'Dining Out',
        icon: 'Utensils',
        type: 'EXPENSE',
        scope: 'GLOBAL',
    },
    {
        name: 'Utilities',
        icon: 'Zap',
        type: 'EXPENSE',
        scope: 'GLOBAL',
    },
    {
        name: 'Entertainment',
        icon: 'Film',
        type: 'EXPENSE',
        scope: 'GLOBAL',
    },
    {
        name: 'Healthcare',
        icon: 'Heart',
        type: 'EXPENSE',
        scope: 'GLOBAL',
    },
    {
        name: 'Shopping',
        icon: 'Shirt',
        type: 'EXPENSE',
        scope: 'GLOBAL',
    },
    {
        name: 'Salary',
        icon: 'Briefcase',
        type: 'INCOME',
        scope: 'GLOBAL',
    },
    {
        name: 'Investment Returns',
        icon: 'TrendingUp',
        type: 'INCOME',
        scope: 'GLOBAL',
    },
    {
        name: 'Gift',
        icon: 'Gift',
        type: 'INCOME',
        scope: 'GLOBAL',
    },
];

async function main() {
    console.log('Seeding global categories...');

    await prisma.category.createMany({
        data: globalCategories,
        skipDuplicates: true,
    });

    console.log(`Seeded ${globalCategories.length} global categories`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
