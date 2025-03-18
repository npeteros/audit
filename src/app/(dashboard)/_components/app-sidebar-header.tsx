import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { ChevronDown, Plus, Wallet } from "lucide-react";
import UserWallets from "./user-wallets";
import AddWalletForm from "./add-wallet-form";

export default function AppSidebarHeader() {
    return (
        <SidebarHeader className="border-muted-foreground border-b">
            <SidebarMenu>
                <SidebarMenuItem>
                    <Dialog>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton>
                                    <Wallet />
                                    Select Wallet
                                    <ChevronDown className="ml-auto" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="min-w-[var(--radix-popper-anchor-width)]">
                                <UserWallets />
                                <DialogTrigger asChild>
                                    <DropdownMenuItem className="bg-primary focus:bg-primary/90 my-2 text-white focus:text-white">
                                        <Plus className="mr-2 text-white" />
                                        <span className="font-semibold">
                                            Create Wallet
                                        </span>
                                    </DropdownMenuItem>
                                </DialogTrigger>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <DialogContent className="sm:max-w-[425px]">
                            <AddWalletForm />
                        </DialogContent>
                    </Dialog>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarHeader>
    );
}
