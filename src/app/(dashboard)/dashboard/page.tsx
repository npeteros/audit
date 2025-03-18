"use client";

import { useUserTransactions } from "@/hooks/transactions";
import { Button } from "@/components/ui/button";
import { Banknote, MinusCircle, Plus, PlusCircle } from "lucide-react";
import { useSession } from "@/hooks/useSession";
import { TransactionIncluded } from "@/types/transactions.types";
import RecentTransactionsTable from "../_components/recent-transactions-table";
import { DatePickerWithRange } from "@/components/ui/date-picker";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Overview } from "../_components/overview";
import { useEffect, useState } from "react";
import { addDays, isAfter, isBefore, isEqual } from "date-fns";
import { DateRange } from "react-day-picker";

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
    const { user } = useSession();
    const { data, isLoading } = useUserTransactions(user ? user.id : "");

    const [filteredTransactions, setFilteredTransactions] = useState<
        TransactionIncluded[] | undefined
    >();
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: addDays(new Date(), -30),
        to: new Date(),
    });

    useEffect(() => {
        if (!data?.transactions) return;

        const filtered = data.transactions.filter(
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
    }, [data, dateRange]);

    const totalIncome = filteredTransactions
        ? filteredTransactions
              .filter((t) => Number(t.amount) > 0)
              .reduce((sum, t) => sum + Number(t.amount), 0) || 0
        : 0;

    const totalExpense = filteredTransactions
        ? Math.abs(
              filteredTransactions
                  ?.filter((t) => Number(t.amount) < 0)
                  .reduce((sum, t) => sum + Number(t.amount), 0) || 0,
          )
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

    return (
        <div className="space-y-6 p-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <div className="flex items-center gap-2">
                    <DatePickerWithRange
                        value={dateRange}
                        onChange={setDateRange}
                    />
                    <Button variant="default" className="cursor-pointer">
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
                            {isLoading
                                ? "Loading..."
                                : `₱ ${balance.toFixed(2)}`}
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
                            {isLoading
                                ? "Loading..."
                                : `₱ ${totalIncome.toFixed(2)}`}
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
                            {isLoading
                                ? "Loading..."
                                : `₱ ${totalExpense.toFixed(2)}`}
                        </div>
                        <p className="text-muted-foreground text-xs">
                            {expenseChange.toFixed(2)}% from last month
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <Overview transactions={filteredTransactions ?? []} />
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader className="flex items-center justify-between">
                        <div>
                            <CardTitle>Recent Transactions</CardTitle>
                            <CardDescription>
                                You made {filteredTransactions?.length}{" "}
                                transactions in the selected period.
                            </CardDescription>
                        </div>
                        <Button variant="default" className="cursor-pointer">
                            <Plus />
                            Add Entry
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <RecentTransactionsTable
                            transactions={filteredTransactions}
                            isLoading={isLoading}
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
