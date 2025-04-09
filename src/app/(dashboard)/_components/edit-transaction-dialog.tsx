"use client";

import { useSession } from "@/hooks/useSession";
import {
    EditTransactionPayload,
    EditTransactionSchema,
} from "@/types/transactions.types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { CalendarIcon } from "lucide-react";
import { useUserCategories } from "@/hooks/categories";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Category } from "@prisma/client";
import { format } from "date-fns";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { useUserWallets } from "@/hooks/wallets";
import { useDeleteTransaction, useEditTransaction } from "@/hooks/transactions";
import { toast } from "sonner";

interface TransactionDialogProps {
    defaultValues: EditTransactionPayload;
}

export default function EditTransactionDialog({
    defaultValues,
}: TransactionDialogProps) {
    const [openDelete, setOpenDelete] = useState(false);
    const [txnType, setTxnType] = useState<"expense" | "income" | "">("");
    const [categoriesByType, setCategoriesByType] = useState<Category[]>([]);
    const { user } = useSession();
    const { data: { categories } = { categories: [] } } = useUserCategories(
        user ? user.id : "",
    );
    const { data: { wallets } = { wallets: [] } } = useUserWallets(
        user ? user.id : "",
    );
    const {
        mutate: editTransaction,
        isPending: isPendingEdit,
        isSuccess: isSuccessEdit,
        isError: isErrorEdit,
        error: editTransactionError,
    } = useEditTransaction();
    const {
        mutate: deleteTransaction,
        isPending: isPendingDelete,
        isSuccess: isSuccessDelete,
        isError: isErrorDelete,
        error: deleteTransactionError,
    } = useDeleteTransaction();

    const form = useForm<EditTransactionPayload>({
        resolver: zodResolver(EditTransactionSchema),
        defaultValues: defaultValues,
    });

    useEffect(() => {
        const defaultCategory: Category | undefined = categories.find(
            (category: Category) =>
                category.id === Number(defaultValues.categoryId),
        );

        if (defaultCategory) {
            setTxnType(
                defaultCategory.type === "EXPENSE" ? "expense" : "income",
            );
        }
    }, [categories, defaultValues.categoryId]);

    useEffect(() => {
        if (txnType === "expense") {
            setCategoriesByType(
                categories.filter(
                    (category: Category) => category.type === "EXPENSE",
                ),
            );
        } else if (txnType === "income") {
            setCategoriesByType(
                categories.filter(
                    (category: Category) => category.type === "INCOME",
                ),
            );
        } else {
            setCategoriesByType(categories);
        }
    }, [txnType, categories]);

    useEffect(() => {
        if (isSuccessEdit) {
            toast.success("Transaction edited successfully");
        }
        if (isErrorEdit) {
            toast.error("Error adding transaction. Please try again.");
        }
        if (isSuccessDelete) {
            toast.success("Transaction deleted successfully");
        }
        if (isErrorDelete) {
            toast.error("Error deleting transaction. Please try again.");
        }
    }, [isSuccessEdit, isErrorEdit, isSuccessDelete, isErrorDelete]);

    async function handleSubmit(data: EditTransactionPayload) {
        try {
            data.transactionDate = new Date(data.transactionDate).toISOString();
            editTransaction(data);
            form.reset();
        } catch (error) {
            console.error("Form submission error: ", error);
            console.error(
                "Transaction submission error: ",
                editTransactionError,
            );
            toast.error("Failed to edit this transaction. Please try again.");
        }
    }

    async function handleDelete() {
        try {
            deleteTransaction({ id: defaultValues.id });
        } catch (error) {
            console.error("Form submission error: ", error);
            console.error(
                "Transaction submission error: ",
                deleteTransactionError,
            );
            toast.error("Failed to edit this transaction. Please try again.");
        }
    }

    return (
        <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
                <DialogTitle>Edit Transaction</DialogTitle>
            </DialogHeader>
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(handleSubmit)}
                    className="space-y-4"
                >
                    <FormField
                        control={form.control}
                        name="walletId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    <span className="font-bold">Wallet </span>
                                    <span className="text-destructive">*</span>
                                </FormLabel>
                                <Select
                                    defaultValue={String(field.value)}
                                    onValueChange={(value) =>
                                        field.onChange(Number(value))
                                    }
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select Wallet" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {wallets.map((wallet) => (
                                            <SelectItem
                                                key={wallet.id}
                                                value={String(wallet.id)}
                                            >
                                                {wallet.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="space-y-2">
                        <Label className="font-bold">
                            Transaction Type{" "}
                            <span className="text-destructive">*</span>
                        </Label>
                        <Select
                            defaultValue={txnType}
                            onValueChange={(value: "expense" | "income") =>
                                setTxnType(value)
                            }
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="expense">Expense</SelectItem>
                                <SelectItem value="income">Income</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <FormField
                        control={form.control}
                        name="categoryId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    <span className="font-bold">Category </span>
                                    <span className="text-destructive">*</span>
                                </FormLabel>
                                <Select
                                    defaultValue={String(field.value)}
                                    onValueChange={(value) =>
                                        field.onChange(Number(value))
                                    }
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select Wallet" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categoriesByType.map((category) => (
                                            <SelectItem
                                                key={category.id}
                                                value={String(category.id)}
                                            >
                                                {category.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="amount"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    <span className="font-bold">Amount </span>
                                    <span className="text-destructive">*</span>
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        placeholder="Enter amount"
                                        {...field}
                                        onChange={(e) =>
                                            field.onChange(
                                                Number.parseInt(e.target.value),
                                            )
                                        }
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    <span className="font-bold">
                                        Description{" "}
                                    </span>
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Enter description"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="transactionDate"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Transaction Date</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full pl-3 text-left font-normal",
                                                    !field.value &&
                                                        "text-muted-foreground",
                                                )}
                                            >
                                                {field.value ? (
                                                    format(field.value, "PPP")
                                                ) : (
                                                    <span>Pick a date</span>
                                                )}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent
                                        className="w-auto p-0"
                                        align="start"
                                    >
                                        <Calendar
                                            mode="single"
                                            selected={new Date(field.value)}
                                            onSelect={(e) =>
                                                field.onChange(
                                                    e?.toLocaleString(),
                                                )
                                            }
                                            disabled={(date) =>
                                                date > new Date() ||
                                                date < new Date("1900-01-01")
                                            }
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="flex justify-end gap-2">
                        <Dialog open={openDelete} onOpenChange={setOpenDelete}>
                            <DialogTrigger asChild>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="flex cursor-pointer items-center gap-2 rounded-md bg-white px-3 py-2"
                                >
                                    Delete
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>
                                        Are you absolutely sure?
                                    </DialogTitle>
                                </DialogHeader>
                                This action cannot be undone. This will
                                permanently delete this transaction and remove
                                this data from our servers.
                                <DialogFooter className="flex justify-end gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="flex cursor-pointer items-center gap-2 rounded-md bg-white px-3 py-2"
                                        onClick={() => setOpenDelete(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2"
                                        onClick={handleDelete}
                                        disabled={isPendingDelete}
                                    >
                                        Continue
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                        <Button
                            type="submit"
                            className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2"
                            disabled={isPendingEdit}
                        >
                            Save
                        </Button>
                    </div>
                </form>
            </Form>
        </DialogContent>
    );
}
