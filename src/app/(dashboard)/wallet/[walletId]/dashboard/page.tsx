"use client";

import { Button } from "@/components/ui/button";
import { Banknote, MinusCircle, PlusCircle } from "lucide-react";
import {
    AddTransactionPayload,
    TransactionIncluded,
} from "@/types/transactions.types";
import RecentTransactionsTable from "@/app/(dashboard)/_components/recent-transactions-table";
import { DatePickerWithRange } from "@/components/ui/date-picker";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Overview } from "@/app/(dashboard)/_components/overview";
import { useEffect, useState } from "react";
import { addDays, isAfter, isBefore, isEqual } from "date-fns";
import { DateRange } from "react-day-picker";
import { notFound } from "next/navigation";
import { useCurrentWallet } from "../../WalletContext";
import TransactionDialog from "@/app/(dashboard)/_components/transaction-dialog";
import { useCreateTransaction } from "@/hooks/transactions";
import { toast } from "sonner";

interface MonthlySummary {
    income: number;
    expense: number;
    balance: number;
}

type SummaryByMonth = Record<string, MonthlySummary>;

function getMonthKey(dateStr: string): string {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
}

function summarizeTransactions(
    transactions: TransactionIncluded[],
): SummaryByMonth {
    const summary: SummaryByMonth = {};

    for (const tx of transactions) {
        const monthKey = getMonthKey(tx.transactionDate.toString());

        if (!summary[monthKey]) {
            summary[monthKey] = { income: 0, expense: 0, balance: 0 };
        }

        const monthSummary = summary[monthKey];

        if (tx.category.type === "income") {
            monthSummary.income += Number(tx.amount);
        } else if (tx.category.type === "expense") {
            monthSummary.expense += Math.abs(Number(tx.amount));
        }

        monthSummary.balance += Number(tx.amount);
    }

    return summary;
}

function calculateChange(current: number, previous: number) {
    if (previous === 0) return current === 0 ? 0 : 100;
    return ((current - previous) / previous) * 100;
}

export default function DashboardPage() {
    const wallet = useCurrentWallet();
    const {
        mutate: createTransaction,
        isPending,
        isSuccess,
        isError,
        error: createTransactionError,
    } = useCreateTransaction();

    const [filteredTransactions, setFilteredTransactions] = useState<
        TransactionIncluded[] | undefined
    >();
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: addDays(new Date(), -30),
        to: new Date(),
    });

    useEffect(() => {
        if (!wallet) return;

        const filtered = wallet.transactions.filter(
            (transaction: TransactionIncluded) => {
                const transactionDate = new Date(transaction.transactionDate);

                if (!dateRange?.from || !dateRange?.to) return true;

                return (
                    (isAfter(transactionDate, dateRange.from) ||
                        isEqual(transactionDate, dateRange.from)) &&
                    (isBefore(transactionDate, dateRange.to) ||
                        isEqual(transactionDate, dateRange.to))
                );
            },
        );

        setFilteredTransactions(filtered);
    }, [dateRange, wallet]);

    const totalIncome = filteredTransactions
        ? filteredTransactions
              .filter((t) => t.category.type === "INCOME")
              .reduce((sum, t) => sum + Number(t.amount), 0) || 0
        : 0;

    const totalExpense = filteredTransactions
        ? filteredTransactions
              .filter((t) => t.category.type === "EXPENSE")
              .reduce((sum, t) => sum + Number(t.amount), 0) || 0
        : 0;

    const balance = totalIncome - totalExpense;

    const summary = summarizeTransactions(filteredTransactions ?? []);

    // Get current and last month keys
    const now = new Date();
    const currentMonthKey = getMonthKey(now.toString());
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthKey = getMonthKey(lastMonth.toString());

    const current = summary[currentMonthKey] || {
        income: 0,
        expense: 0,
        balance: 0,
    };
    const previous = summary[lastMonthKey] || {
        income: 0,
        expense: 0,
        balance: 0,
    };

    // Calculate changes
    const incomeChange = calculateChange(current.income, previous.income);
    const expenseChange = calculateChange(current.expense, previous.expense);
    const balanceChange = calculateChange(current.balance, previous.balance);

    const handleAddTransaction = async (data: AddTransactionPayload) => {
        try {
            createTransaction(data);
        } catch (error) {
            console.error("Form submission error: ", error);
            console.error(
                "Transaction submission error: ",
                createTransactionError,
            );
            toast.error(
                "Failed to create a new transaction. Please try again.",
            );
        }
    };

    if (!wallet) return notFound();

    return (
        <div className="space-y-6 p-4">
            <div className="flex flex-wrap items-center justify-between">
                <h1 className="text-2xl font-bold">{wallet.name}</h1>
                <div className="flex flex-wrap items-center gap-2">
                    <DatePickerWithRange
                        value={dateRange}
                        onChange={setDateRange}
                    />
                    <Button
                        variant="default"
                        className="w-full cursor-pointer sm:w-fit"
                    >
                        Download
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Balance
                        </CardTitle>
                        <Banknote className="text-muted-foreground h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            ₱
                            {balance.toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}
                        </div>
                        <p className="text-muted-foreground text-xs">
                            {balanceChange.toFixed(2)}% from last month
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Income
                        </CardTitle>
                        <PlusCircle className="text-muted-foreground h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            ₱
                            {totalIncome.toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}
                        </div>
                        <p className="text-muted-foreground text-xs">
                            {incomeChange.toFixed(2)}% from last month
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Expenses
                        </CardTitle>
                        <MinusCircle className="text-muted-foreground h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            ₱
                            {totalExpense.toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}
                        </div>
                        <p className="text-muted-foreground text-xs">
                            {expenseChange.toFixed(2)}% from last month
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 lg:grid-cols-7">
                <Card className="lg:col-span-4">
                    <CardHeader>
                        <CardTitle>Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <Overview transactions={filteredTransactions ?? []} />
                    </CardContent>
                </Card>
                <Card className="lg:col-span-3">
                    <CardHeader className="flex flex-col items-start justify-between sm:flex-row sm:items-center">
                        <div>
                            <CardTitle>Recent Transactions</CardTitle>
                            <CardDescription>
                                You made {filteredTransactions?.length}{" "}
                                transactions in the selected period.
                            </CardDescription>
                        </div>
                        <TransactionDialog
                            mode="add"
                            onSubmit={handleAddTransaction}
                            walletId={wallet.id}
                            isPending={isPending}
                            isSuccess={isSuccess}
                            isError={isError}
                        />
                    </CardHeader>
                    <CardContent>
                        <RecentTransactionsTable
                            transactions={filteredTransactions}
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
