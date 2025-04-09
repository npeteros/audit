"use client";

import { useSession } from "@/hooks/useSession";
import {
    AddTransactionPayload,
    AddTransactionSchema,
} from "@/types/transactions.types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
    Dialog,
    DialogContent,
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
import { CalendarIcon, Plus } from "lucide-react";
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
import { useCreateTransaction } from "@/hooks/transactions";
import { toast } from "sonner";

interface TransactionDialogProps {
    walletId?: number;
}

export default function AddTransactionDialog({
    walletId = 0,
}: TransactionDialogProps) {
    const [open, setOpen] = useState(false);
    const [txnType, setTxnType] = useState<"expense" | "income">("expense");
    const [categoriesByType, setCategoriesByType] = useState<Category[]>([]);
    const { user } = useSession();
    const { data: { categories } = { categories: [] } } = useUserCategories(
        user ? user.id : "",
    );
    const { data: { wallets } = { wallets: [] } } = useUserWallets(
        user ? user.id : "",
    );

    const {
        mutate: createTransaction,
        isPending,
        isSuccess,
        isError,
        error: createTransactionError,
    } = useCreateTransaction();

    const form = useForm<AddTransactionPayload>({
        resolver: zodResolver(AddTransactionSchema),
        defaultValues: {
            userId: "",
            walletId,
            categoryId: 0,
            transactionDate: "",
            description: "",
            amount: 0,
        },
    });

    useEffect(() => {
        if (txnType === "expense") {
            setCategoriesByType(
                categories.filter(
                    (category: Category) => category.type === "EXPENSE",
                ),
            );
        } else {
            setCategoriesByType(
                categories.filter(
                    (category: Category) => category.type === "INCOME",
                ),
            );
        }
    }, [txnType, categories]);

    useEffect(() => {
        if (isSuccess) {
            toast.success("Transaction added successfully");
        }
        if (isError) {
            toast.error("Error adding transaction. Please try again.");
        }
    }, [isSuccess, isError]);

    async function handleSubmit(data: AddTransactionPayload) {
        try {
            data.userId = user?.id ?? "";
            data.categoryId = Number(data.categoryId);
            data.amount = Number(data.amount);
            data.transactionDate = new Date(data.transactionDate).toISOString();

            createTransaction(data);

            form.reset();
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
    }

    return (
        <Dialog
            open={open}
            onOpenChange={(open) => 
                setOpen(open)
            }
        >
            <DialogTrigger asChild>
                <Button className="flex w-full cursor-pointer items-center gap-2 rounded-md px-3 py-2 sm:w-fit">
                    Add Transaction <Plus className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Add Transaction</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(handleSubmit)}
                        className="space-y-4"
                    >
                        {!walletId && (
                            <FormField
                                control={form.control}
                                name="walletId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            <span className="font-bold">
                                                Wallet{" "}
                                            </span>
                                            <span className="text-destructive">
                                                *
                                            </span>
                                        </FormLabel>
                                        <Select
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
                                                        value={String(
                                                            wallet.id,
                                                        )}
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
                        )}
                        <div className="space-y-2">
                            <Label className="font-bold">
                                Transaction Type{" "}
                                <span className="text-destructive">*</span>
                            </Label>
                            <Select
                                value={txnType}
                                onValueChange={(value: "expense" | "income") =>
                                    setTxnType(value)
                                }
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="expense">
                                        Expense
                                    </SelectItem>
                                    <SelectItem value="income">
                                        Income
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <FormField
                            control={form.control}
                            name="categoryId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        <span className="font-bold">
                                            Category{" "}
                                        </span>
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </FormLabel>
                                    <Select
                                        onValueChange={(value) =>
                                            field.onChange(
                                                Number.parseInt(value),
                                            )
                                        }
                                        defaultValue={String(field.value)}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select Category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categoriesByType.map(
                                                (category) => (
                                                    <SelectItem
                                                        key={category.id}
                                                        value={String(
                                                            category.id,
                                                        )}
                                                    >
                                                        {category.name}
                                                    </SelectItem>
                                                ),
                                            )}
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
                                        <span className="font-bold">
                                            Amount{" "}
                                        </span>
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min={1}
                                            placeholder="Enter amount"
                                            onChange={(e) =>
                                                field.onChange(
                                                    Number.parseInt(
                                                        e.target.value,
                                                    ),
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
                                                        format(
                                                            field.value,
                                                            "PPP",
                                                        )
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
                                                    date <
                                                        new Date("1900-01-01")
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
                            <Button
                                type="button"
                                variant="outline"
                                className="flex cursor-pointer items-center gap-2 rounded-md bg-white px-3 py-2"
                                onClick={() => setOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2"
                                disabled={!form.formState.isValid || isPending}
                            >
                                Submit
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
