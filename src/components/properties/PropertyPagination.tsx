"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PropertyPaginationProps {
  currentPage: number;
  totalPages: number;
}

export default function PropertyPagination({
  currentPage,
  totalPages,
}: PropertyPaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const createPageUrl = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (pageNumber === 1) {
      params.delete("page");
    } else {
      params.set("page", pageNumber.toString());
    }
    const query = params.toString();
    return query ? `${pathname}?${query}` : pathname;
  };

  // Generate page numbers to show (e.g. 1, 2, 3 ... with ellipsis if many)
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const delta = 1; // Number of pages around current page

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== "...") {
        pages.push("...");
      }
    }
    return pages;
  };

  const pages = getPageNumbers();
  const prevPage = Math.max(1, currentPage - 1);
  const nextPage = Math.min(totalPages, currentPage + 1);

  return (
    <nav
      aria-label="Property catalog pagination"
      className="mt-12 flex items-center justify-center gap-1.5 sm:gap-2"
    >
      {/* Previous Button */}
      {currentPage > 1 ? (
        <Link
          href={createPageUrl(prevPage)}
          className="inline-flex h-9 items-center justify-center gap-1 rounded-lg border border-divider bg-surface px-3 font-sans text-xs font-medium text-foreground transition-colors hover:bg-background hover:border-secondary/40 shadow-xs"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Previous</span>
        </Link>
      ) : (
        <span
          aria-disabled="true"
          className="inline-flex h-9 items-center justify-center gap-1 rounded-lg border border-divider/50 bg-surface/50 px-3 font-sans text-xs font-medium text-muted/50 cursor-not-allowed opacity-60"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Previous</span>
        </span>
      )}

      {/* Numbered Page Buttons */}
      <div className="flex items-center gap-1">
        {pages.map((p, idx) => {
          if (p === "...") {
            return (
              <span
                key={`ellipsis-${idx}`}
                className="flex h-9 w-8 items-center justify-center font-sans text-xs text-muted"
              >
                ...
              </span>
            );
          }

          const pageNum = Number(p);
          const isCurrent = pageNum === currentPage;

          return isCurrent ? (
            <span
              key={pageNum}
              aria-current="page"
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary font-sans text-xs font-semibold text-white shadow-xs"
            >
              {pageNum}
            </span>
          ) : (
            <Link
              key={pageNum}
              href={createPageUrl(pageNum)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-divider bg-surface font-sans text-xs font-medium text-foreground transition-colors hover:bg-background hover:border-secondary/40 shadow-xs"
            >
              {pageNum}
            </Link>
          );
        })}
      </div>

      {/* Next Button */}
      {currentPage < totalPages ? (
        <Link
          href={createPageUrl(nextPage)}
          className="inline-flex h-9 items-center justify-center gap-1 rounded-lg border border-divider bg-surface px-3 font-sans text-xs font-medium text-foreground transition-colors hover:bg-background hover:border-secondary/40 shadow-xs"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      ) : (
        <span
          aria-disabled="true"
          className="inline-flex h-9 items-center justify-center gap-1 rounded-lg border border-divider/50 bg-surface/50 px-3 font-sans text-xs font-medium text-muted/50 cursor-not-allowed opacity-60"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </span>
      )}
    </nav>
  );
}
