import Link from "next/link";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  baseUrl: string;
  searchParams?: Record<string, string | number | undefined | null>;
  itemLabel?: string;
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  baseUrl,
  searchParams = {},
  itemLabel = "guides",
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const startItem = Math.min(totalItems, (currentPage - 1) * pageSize + 1);
  const endItem = Math.min(totalItems, currentPage * pageSize);

  function createPageUrl(pageNumber: number) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams)) {
      if (key !== "page" && value !== undefined && value !== null && value !== "") {
        params.set(key, String(value));
      }
    }
    if (pageNumber > 1) {
      params.set("page", String(pageNumber));
    }
    const qs = params.toString();
    return qs ? `${baseUrl}?${qs}` : baseUrl;
  }

  const pageNumbers: (number | "...")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
  } else {
    pageNumbers.push(1);
    if (currentPage > 3) {
      pageNumbers.push("...");
    }
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) {
      pageNumbers.push(i);
    }
    if (currentPage < totalPages - 2) {
      pageNumbers.push("...");
    }
    pageNumbers.push(totalPages);
  }

  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return (
    <nav className="pagination" aria-label="Pagination">
      <div className="paginationSummary">
        Showing <b>{startItem}–{endItem}</b> of <b>{totalItems}</b> {itemLabel} · Page <b>{currentPage}</b> of <b>{totalPages}</b>
      </div>
      <div className="paginationControls">
        {hasPrev ? (
          <Link
            href={createPageUrl(currentPage - 1)}
            className="paginationPrev"
            aria-label="Previous page"
          >
            ← Previous
          </Link>
        ) : (
          <span className="paginationPrev disabled" aria-disabled="true">
            ← Previous
          </span>
        )}

        <div className="paginationPages">
          {pageNumbers.map((p, idx) => {
            if (p === "...") {
              return (
                <span key={`ellipsis-${idx}`} className="paginationPage ellipsis" aria-hidden="true">
                  …
                </span>
              );
            }
            const isCurrent = p === currentPage;
            return isCurrent ? (
              <span
                key={p}
                className="paginationPage active"
                aria-current="page"
                aria-label={`Page ${p}`}
              >
                {p}
              </span>
            ) : (
              <Link
                key={p}
                href={createPageUrl(p)}
                className="paginationPage"
                aria-label={`Go to page ${p}`}
              >
                {p}
              </Link>
            );
          })}
        </div>

        {hasNext ? (
          <Link
            href={createPageUrl(currentPage + 1)}
            className="paginationNext"
            aria-label="Next page"
          >
            Next →
          </Link>
        ) : (
          <span className="paginationNext disabled" aria-disabled="true">
            Next →
          </span>
        )}
      </div>
    </nav>
  );
}
