"use client";

import { TransactionIncluded } from "@/types/transactions.types";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";

export function Overview({
    transactions,
}: {
    transactions: TransactionIncluded[];
}) {
    const monthMap = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
    ];

    type MonthName = (typeof monthMap)[number];

    const monthlyTotals: Record<MonthName, number> = {
        Jan: 0,
        Feb: 0,
        Mar: 0,
        Apr: 0,
        May: 0,
        Jun: 0,
        Jul: 0,
        Aug: 0,
        Sep: 0,
        Oct: 0,
        Nov: 0,
        Dec: 0,
    };

    transactions.forEach((tx) => {
        const date = new Date(tx.transactionDate);
        const monthName = monthMap[date.getMonth()];
        monthlyTotals[monthName] += Number(tx.amount);
    });

    const data = Object.keys(monthlyTotals).map((month) => ({
        name: month,
        total: monthlyTotals[month],
    }));

    return (
        <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data}>
                <XAxis
                    dataKey="name"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                />
                <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `₱ ${value}`}
                />
                <Bar
                    dataKey="total"
                    fill="currentColor"
                    radius={[4, 4, 0, 0]}
                    className="fill-primary"
                />
            </BarChart>
        </ResponsiveContainer>
    );
}
