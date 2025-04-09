"use client";

import { Button } from "@/components/ui/button";
import { DatePickerWithRange } from "@/components/ui/date-picker";
import { DateRange } from "react-day-picker";

export default function Header({
    title,
    date,
    actionButton,
    onChange,
}: {
    title: string;
    date: DateRange | undefined;
    actionButton?: React.ReactNode;
    onChange: (range: DateRange | undefined) => void;
}) {
    return (
        <>
            <div className="flex flex-col gap-4 md:hidden">
                <div className="flex flex-wrap items-center justify-between">
                    <h1 className="text-2xl font-bold">{title}</h1>
                    <div className="flex gap-2">
                        <DatePickerWithRange value={date} onChange={onChange} />
                        <Button variant="default" className="cursor-pointer">
                            Download
                        </Button>
                    </div>
                </div>
                <div className="flex justify-end">{actionButton}</div>
            </div>
            <div className="hidden items-center justify-between md:flex">
                <h1 className="text-2xl font-bold">{title}</h1>
                <div className="flex items-center gap-2">
                    <DatePickerWithRange value={date} onChange={onChange} />
                    <Button variant="default" className="cursor-pointer">
                        Download
                    </Button>
                    {actionButton}
                </div>
            </div>
        </>
    );
}
