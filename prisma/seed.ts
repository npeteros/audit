import { PrismaClient, TransactionType } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { Decimal } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

async function main() {
    // Seed Users
    const adminUser = prisma.user.create({
        data: {
            id: 'ff27927d-445e-47db-9007-3156d3ed7cdc',
            email: 'peterosneal2003@gmail.com',
        },
    })
    const users = await Promise.all(
        Array.from({ length: 5 }).map(() =>
            prisma.user.create({
                data: {
                    email: faker.internet.email(),
                },
            })
        ).concat([adminUser])
    );


    // Seed Wallets
    const wallets = await Promise.all(
        users.flatMap((user) =>
            Array.from({ length: 2 }).map(() =>
                prisma.wallet.create({
                    data: {
                        userId: user.id,
                        name: faker.finance.accountName(),
                        balance: new Decimal(faker.finance.amount({ min: 100, max: 10000, dec: 2 })),
                    },
                })
            )
        )
    );

    // Seed Categories
    const categories = await Promise.all(
        users.flatMap((user) =>
            [
                {
                    name: 'Groceries',
                    icon: '🛒',
                    type: 'EXPENSE',
                },
                {
                    name: 'Salary',
                    icon: '💰',
                    type: 'INCOME',
                },
                {
                    name: 'Entertainment',
                    icon: '🎬',
                    type: 'EXPENSE',
                },
                {
                    name: 'Freelance',
                    icon: '🧑‍💻',
                    type: 'INCOME',
                },
                {
                    name: 'Transportation',
                    icon: '🚌',
                    type: 'EXPENSE',
                },
            ].map((cat) =>
                prisma.category.create({
                    data: {
                        userId: user.id,
                        walletId: wallets[Math.floor(Math.random() * wallets.length)].id,
                        name: cat.name,
                        icon: cat.icon,
                        type: cat.type as TransactionType,
                    },
                })
            )
        )
    );

    // Seed Transactions
    await Promise.all(
        users.flatMap((user) =>
            Array.from({ length: 10 }).map(() => {
                const wallet = wallets[Math.floor(Math.random() * wallets.length)];
                const userCategories = categories.filter((cat) => cat.userId === user.id);
                const category = userCategories[Math.floor(Math.random() * userCategories.length)];
                const amount = new Decimal(faker.finance.amount({ min: 1, max: 1000, dec: 2 }));
                return prisma.transaction.create({
                    data: {
                        userId: user.id,
                        walletId: wallet.id,
                        categoryId: category.id,
                        transactionDate: faker.date.recent({ days: 30 }),
                        description: faker.lorem.sentence(),
                        amount: amount,
                    },
                });
            })
        )
    );

    console.log('🌱 Seeding complete!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
