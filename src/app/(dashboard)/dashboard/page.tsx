"use client";

import { useUserTransactions } from "@/hooks/transactions";
import { Button } from "@/components/ui/button";
import { Banknote, MinusCircle, PlusCircle } from "lucide-react";
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
                        <div className="text-2xl font-bold">₱ {balance}</div>
                        <p className="text-muted-foreground text-xs">
                            +20.1% from last month
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
                            ₱ {totalIncome}
                        </div>
                        <p className="text-muted-foreground text-xs">
                            +180.1% from last month
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
                            ₱ {totalExpense}
                        </div>
                        <p className="text-muted-foreground text-xs">
                            +0% from last month
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
                    <CardHeader>
                        <CardTitle>Recent Transactions</CardTitle>
                        <CardDescription>
                            You made 265 sales this month.
                        </CardDescription>
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
