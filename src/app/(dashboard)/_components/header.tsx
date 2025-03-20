"use client";

import { Button } from "@/components/ui/button";
import { DatePickerWithRange } from "@/components/ui/date-picker";
import { DateRange } from "react-day-picker";

export default function Header({
    title,
    date,
    onChange,
}: {
    title: string;
    date: DateRange | undefined;
    onChange: (range: DateRange | undefined) => void;
}) {
    return (
        <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">{title}</h1>
            <div className="flex items-center gap-2">
                <DatePickerWithRange value={date} onChange={onChange} />
                <Button variant="default" className="cursor-pointer">
                    Download
                </Button>
            </div>
        </div>
    );
}
