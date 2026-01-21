'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import type { PaginationMeta } from '@/types/transactions.types';

interface PaginationProps {
    meta: PaginationMeta;
    disabled?: boolean;
}

export function Pagination({ meta, disabled = false }: PaginationProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const handlePageChange = (newPage: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', newPage.toString());
        router.push(`/dashboard/transactions?${params.toString()}`);
    };

    const handlePageSizeChange = (newPageSize: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('pageSize', newPageSize);
        params.set('page', '1'); // Reset to first page
        router.push(`/dashboard/transactions?${params.toString()}`);
    };

    const { page, pageSize, total, totalPages } = meta;

    // Calculate visible page numbers
    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            // Show all pages
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Show pages with ellipsis
            if (page <= 3) {
                for (let i = 1; i <= 4; i++) {
                    pages.push(i);
                }
                pages.push('ellipsis');
                pages.push(totalPages);
            } else if (page >= totalPages - 2) {
                pages.push(1);
                pages.push('ellipsis');
                for (let i = totalPages - 3; i <= totalPages; i++) {
                    pages.push(i);
                }
            } else {
                pages.push(1);
                pages.push('ellipsis');
                for (let i = page - 1; i <= page + 1; i++) {
                    pages.push(i);
                }
                pages.push('ellipsis');
                pages.push(totalPages);
            }
        }

        return pages;
    };

    const startRecord = total === 0 ? 0 : (page - 1) * pageSize + 1;
    const endRecord = Math.min(page * pageSize, total);

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
            {/* Results count */}
            <div className="text-sm text-muted-foreground">
                Showing {startRecord}-{endRecord} of {total} transactions
            </div>

            {/* Pagination controls */}
            <div className="flex items-center gap-2">
                {/* Page size selector */}
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Rows per page:</span>
                    <Select value={pageSize.toString()} onValueChange={handlePageSizeChange} disabled={disabled}>
                        <SelectTrigger className="h-8 w-[70px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="20">20</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                            <SelectItem value="100">100</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Page navigation */}
                <div className="flex items-center gap-1">
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handlePageChange(1)} disabled={disabled || page === 1}>
                        <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handlePageChange(page - 1)} disabled={disabled || page === 1}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>

                    {/* Page numbers */}
                    <div className="flex items-center gap-1">
                        {getPageNumbers().map((pageNum, index) => {
                            if (pageNum === 'ellipsis') {
                                return (
                                    <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">
                                        ...
                                    </span>
                                );
                            }

                            return (
                                <Button
                                    key={pageNum}
                                    variant={pageNum === page ? 'default' : 'outline'}
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => handlePageChange(pageNum as number)}
                                    disabled={disabled}
                                >
                                    {pageNum}
                                </Button>
                            );
                        })}
                    </div>

                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handlePageChange(page + 1)} disabled={disabled || page === totalPages}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handlePageChange(totalPages)} disabled={disabled || page === totalPages}>
                        <ChevronsRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
