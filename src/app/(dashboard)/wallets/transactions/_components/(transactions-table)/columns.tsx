"use client";

import { Button } from "@/components/ui/button";
import { TransactionIncluded } from "@/types/transactions.types";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

export const columns: ColumnDef<TransactionIncluded>[] = [
    {
        accessorKey: "transactionDate",
        accessorFn: (row: TransactionIncluded) => new Date(row.transactionDate), //mm/dd/yy format
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }
                >
                    Date
                    <ArrowUpDown className="ml-2 size-3" />
                </Button>
            );
        },
        cell: (info) => info.getValue<Date>().toLocaleDateString(),
    },
    {
        accessorKey: "wallet.name",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }
                >
                    Wallet
                    <ArrowUpDown className="ml-2 size-3" />
                </Button>
            );
        },
    },
    {
        accessorKey: "category.name", // transaction.category.name
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }
                >
                    Category
                    <ArrowUpDown className="ml-2 size-3" />
                </Button>
            );
        },
    },
    {
        accessorKey: "description",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }
                >
                    Description
                    <ArrowUpDown className="ml-2 size-3" />
                </Button>
            );
        },
    },
    {
        accessorKey: "amount",
        accessorFn: (row: TransactionIncluded) => Number(row.amount).toFixed(2),
        cell: ({ row }) => {
            const { category, amount } = row.original;
            return (
                <span
                    className={`text-right ${
                        category.type === "INCOME"
                            ? "text-green-600"
                            : "text-red-600"
                    }`}
                >
                    {category.type === "EXPENSE" ? "-" : "+"}₱{" "}
                    {Number(amount).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    })}
                </span>
            );
        },
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }
                >
                    Amount
                    <ArrowUpDown className="ml-2 size-3" />
                </Button>
            );
        },
    },
];
