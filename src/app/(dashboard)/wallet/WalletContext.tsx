"use client";

import { WalletIncluded } from "@/types/wallets.types";
import { createContext, useContext } from "react";

const WalletContext = createContext<WalletIncluded | null>(null);

export const useCurrentWallet = () => {
    const context = useContext(WalletContext);
    if (!context)
        throw new Error("useCurrentWallet must be used within WalletProvider");
    return context;
};

export const WalletProvider = ({
    children,
    wallet,
}: {
    children: React.ReactNode;
    wallet: WalletIncluded;
}) => {
    return (
        <WalletContext.Provider value={wallet}>
            {children}
        </WalletContext.Provider>
    );
};
