"use client";

import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { TransactionIncluded } from "@/types/transactions.types";

export default function RecentTransactionsTable({
    transactions,
    isLoading,
}: {
    transactions: TransactionIncluded[] | undefined;
    isLoading?: boolean;
}) {
    return (
        <Table>
            <TableCaption>Click on a transaction to view details</TableCaption>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-[100px]">Date</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {isLoading ? (
                    <TableRow>
                        <TableCell colSpan={3} className="text-center">
                            Loading transactions...
                        </TableCell>
                    </TableRow>
                ) : transactions?.length ? (
                    transactions?.slice(0, 5).map((txn) => (
                        <Dialog key={txn.id}>
                            <DialogTrigger asChild>
                                <TableRow className="hover:bg-muted cursor-pointer">
                                    <TableCell>
                                        {new Date(
                                            txn.transactionDate,
                                        ).toLocaleDateString("en-US", {
                                            month: "long",
                                            day: "numeric",
                                            year: "numeric",
                                        })}
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {txn.category.name}
                                    </TableCell>
                                    <TableCell
                                        className={`text-right ${
                                            txn.category.type === "INCOME"
                                                ? "text-green-600"
                                                : "text-red-600"
                                        }`}
                                    >
                                        {txn.category.type === "EXPENSE"
                                            ? "-"
                                            : "+"}
                                        ₱ {Number(txn.amount).toFixed(2)}
                                    </TableCell>
                                </TableRow>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>
                                        Transaction Details
                                    </DialogTitle>
                                    <DialogDescription>
                                        <p>
                                            Category:{" "}
                                            <strong>{txn.category.name}</strong>
                                        </p>
                                        <p>
                                            Date:{" "}
                                            <strong>
                                                {new Date(
                                                    txn.transactionDate,
                                                ).toLocaleDateString("en-US", {
                                                    month: "long",
                                                    day: "numeric",
                                                    year: "numeric",
                                                })}
                                            </strong>
                                        </p>
                                        <p>
                                            Description:{" "}
                                            <strong>{txn.description}</strong>
                                        </p>
                                    </DialogDescription>
                                </DialogHeader>
                            </DialogContent>
                        </Dialog>
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={3} className="text-center">
                            No transactions yet.
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );
}
