"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationControlsProps {
    currentPage: number;
    totalPages: number;
}

export default function PaginationControls({
    currentPage,
    totalPages,
}: PaginationControlsProps) {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    if (totalPages <= 1) return null;

    const createPageURL = (pageNumber: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", pageNumber.toString());
        return `${pathname}?${params.toString()}`;
    };

    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
        <div className="flex items-center justify-center space-x-2 mt-12 mb-8">
            <Link
                href={createPageURL(currentPage - 1)}
                className={`p-2 rounded-md border text-sm font-medium transition-colors hover:bg-accent hover:text-white ${currentPage === 1 ? "pointer-events-none opacity-50" : ""
                    }`}
                aria-disabled={currentPage === 1}
            >
                <ChevronLeft className="w-5 h-5" />
                <span className="sr-only">Página anterior</span>
            </Link>

            {pages.map((page) => (
                <Link
                    key={page}
                    href={createPageURL(page)}
                    className={`flex h-10 w-10 items-center justify-center rounded-md border text-sm font-semibold transition-colors hover:bg-accent hover:text-white ${page === currentPage
                            ? "bg-primary text-white pointer-events-none"
                            : "text-primary hover:bg-accent hover:text-white"
                        }`}
                >
                    {page}
                </Link>
            ))}

            <Link
                href={createPageURL(currentPage + 1)}
                className={`p-2 rounded-md border text-sm font-medium transition-colors hover:bg-accent hover:text-white ${currentPage === totalPages ? "pointer-events-none opacity-50" : ""
                    }`}
                aria-disabled={currentPage === totalPages}
            >
                <ChevronRight className="w-5 h-5" />
                <span className="sr-only">Página siguiente</span>
            </Link>
        </div>
    );
}
