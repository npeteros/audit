"use client";

import {
    useUserTransactions,
} from "@/hooks/transactions";
import { useSession } from "@/hooks/useSession";
import {
    TransactionIncluded,
} from "@/types/transactions.types";
import { addDays, isAfter, isBefore, isEqual } from "date-fns";
import { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
import Header from "../../_components/header";
import TransactionsTable from "./_components/(transactions-table)/transactions-table";
import { columns } from "./_components/(transactions-table)/columns";
import AddTransactionDialog from "../../_components/add-transaction-dialog";

export default function Transactions() {
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

        const filtered = data.transactions
            .sort(
                (a: TransactionIncluded, b: TransactionIncluded) =>
                    new Date(b.transactionDate).getTime() -
                    new Date(a.transactionDate).getTime(),
            )
            .filter((transaction: TransactionIncluded) => {
                const transactionDate = new Date(transaction.transactionDate);

                if (!dateRange?.from || !dateRange?.to) return true;

                return (
                    (isAfter(transactionDate, dateRange.from) ||
                        isEqual(transactionDate, dateRange.from)) &&
                    (isBefore(transactionDate, dateRange.to) ||
                        isEqual(transactionDate, dateRange.to))
                );
            });

        setFilteredTransactions(filtered);
    }, [data, dateRange]);

    return (
        <div className="space-y-6 p-4">
            <Header
                title="Transactions"
                date={dateRange}
                actionButton={
                    <AddTransactionDialog />
                }
                onChange={setDateRange}
            />

            <TransactionsTable
                columns={columns}
                data={filteredTransactions ?? []}
                isLoading={isLoading}
            />
        </div>
    );
}
