'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Field, FieldLabel } from '@/components/ui/field';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { addDays, format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { type DateRange } from 'react-day-picker';
import { getLast7Days, getLast30Days, getThisMonth, getLastMonth, getThisYear } from '@/lib/utils';

export interface DatePickerProps {
    date?: Date;
    onDateChange?: (date: Date | undefined) => void;
    className?: string;
    placeholder?: string;
    disabled?: boolean;
    align?: 'start' | 'center' | 'end';
}

export function DatePicker({ date, onDateChange, className, placeholder = 'Pick a date', disabled = false, align = 'start' }: DatePickerProps) {
    const [isOpen, setIsOpen] = React.useState(false);

    return (
        <Field className={className}>
            <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                    <Button variant="outline" disabled={disabled} className="justify-start px-2.5 font-normal">
                        <CalendarIcon />
                        {date ? format(date, 'LLL dd, y') : <span>{placeholder}</span>}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align={align}>
                    <Calendar mode="single" selected={date} onSelect={onDateChange} disabled={disabled} />
                </PopoverContent>
            </Popover>
        </Field>
    );
}

export interface DatePickerWithRangeProps {
    value?: DateRange;
    onChange?: (date: DateRange | undefined) => void;
    className?: string;
    placeholder?: string;
    disabled?: boolean;
    numberOfMonths?: number;
    align?: 'start' | 'center' | 'end';
}

export function DatePickerWithRange({ value, onChange, className, placeholder = 'Pick a date', disabled = false, numberOfMonths = 2, align = 'start' }: DatePickerWithRangeProps) {
    const [internalDate, setInternalDate] = React.useState<DateRange | undefined>(value);
    const [isOpen, setIsOpen] = React.useState(false);

    // Use controlled value if provided, otherwise use internal state
    const date = value ?? internalDate;

    const handleSelect = (newDate: DateRange | undefined) => {
        if (!value) {
            setInternalDate(newDate);
        }
        onChange?.(newDate);
    };

    const handlePresetClick = (preset: DateRange) => {
        handleSelect(preset);
        setIsOpen(false);
    };

    return (
        <Field className={className}>
            <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                    <Button variant="outline" disabled={disabled} className="justify-start px-2.5 font-normal">
                        <CalendarIcon />
                        {date?.from ? (
                            date.to ? (
                                <>
                                    {format(date.from, 'LLL dd, y')} - {format(date.to, 'LLL dd, y')}
                                </>
                            ) : (
                                format(date.from, 'LLL dd, y')
                            )
                        ) : (
                            <span>{placeholder}</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align={align}>
                    <div className="flex flex-col">
                        {/* Quick preset buttons */}
                        <div className="flex flex-wrap gap-2 border-b p-3">
                            <Button variant="outline" size="sm" onClick={() => handlePresetClick(getLast7Days())} className="h-7 text-xs">
                                Last 7 Days
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handlePresetClick(getLast30Days())} className="h-7 text-xs">
                                Last 30 Days
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handlePresetClick(getThisMonth())} className="h-7 text-xs">
                                This Month
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handlePresetClick(getLastMonth())} className="h-7 text-xs">
                                Last Month
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handlePresetClick(getThisYear())} className="h-7 text-xs">
                                This Year
                            </Button>
                        </div>
                        {/* Calendar */}
                        <Calendar mode="range" defaultMonth={date?.from} selected={date} onSelect={handleSelect} numberOfMonths={numberOfMonths} disabled={disabled} />
                    </div>
                </PopoverContent>
            </Popover>
        </Field>
    );
}
