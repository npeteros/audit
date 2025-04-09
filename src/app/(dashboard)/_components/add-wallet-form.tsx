"use client";

import {
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useCreateWallet } from "@/hooks/wallets";
import { useSession } from "@/hooks/useSession";

const formSchema = z.object({
    name: z
        .string({
            required_error: "Name is required",
            invalid_type_error: "Name must be a string",
        })
        .min(1, { message: "Name is required" }),
});

export default function AddWalletForm() {
    const {
        mutate: createWallet,
        isPending,
        isSuccess,
        isError,
        error,
    } = useCreateWallet();
    const { user } = useSession();
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            createWallet({
                name: values.name,
                userId: user?.id as string,
                balance: 0,
            });
        } catch (error) {
            console.error("Form submission error", error);
            toast.error("Failed to submit the form. Please try again.");
        }
    }
    return (
        <>
            <DialogHeader>
                <DialogTitle>Add Wallet</DialogTitle>
                <DialogDescription>
                    Add a new wallet to your account to track your finances.
                </DialogDescription>
            </DialogHeader>
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-8"
                >
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Wallet Name</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Personal Savings"
                                        type="text"
                                        {...field}
                                    />
                                </FormControl>
                                <FormDescription>
                                    Add a new wallet to your account to track
                                    your finances.
                                </FormDescription>
                                <FormMessage />
                                {isSuccess && (
                                    <p className="text-sm text-green-600">
                                        Wallet created!
                                    </p>
                                )}
                                {isError && (
                                    <p className="text-sm text-red-600">
                                        Error: {error.message}
                                    </p>
                                )}
                            </FormItem>
                        )}
                    />

                    <div className="flex justify-end">
                        <Button type="submit" disabled={isPending}>
                            Submit
                        </Button>
                    </div>
                </form>
            </Form>
        </>
    );
}
