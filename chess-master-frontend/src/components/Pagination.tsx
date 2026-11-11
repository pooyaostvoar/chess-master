import React from "react";

function pageList(current: number, total: number): Array<number | "gap"> {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = [1, total, current - 1, current, current + 1]
    .filter((p, i, all) => p >= 1 && p <= total && all.indexOf(p) === i)
    .sort((a, b) => a - b);
  const list: Array<number | "gap"> = [];
  pages.forEach((p, i) => {
    if (i > 0 && p - pages[i - 1] > 1) list.push("gap");
    list.push(p);
  });
  return list;
}

const pageButtonClass =
  "inline-flex items-center justify-center min-w-[28px] h-7 px-2.5 rounded-full text-xs transition-colors";

type PaginationProps = {
  page: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  pageSizeOptions?: readonly number[];
  onPageSizeChange?: (pageSize: number) => void;
  className?: string;
};

export const Pagination: React.FC<PaginationProps> = ({
  page,
  pageSize,
  totalItems,
  onPageChange,
  pageSizeOptions,
  onPageSizeChange,
  className = "mt-7",
}) => {
  if (pageSize < 1 || totalItems < 1) return null;

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const current = Math.min(Math.max(page, 1), totalPages);
  const smallestSize = pageSizeOptions?.length
    ? Math.min(...pageSizeOptions)
    : pageSize;
  const showPageSize = Boolean(
    onPageSizeChange && pageSizeOptions && totalItems > smallestSize
  );

  if (totalPages <= 1 && !showPageSize) return null;

  return (
    <div
      className={`${className} flex max-w-full flex-wrap items-center justify-center gap-x-4 gap-y-2`}
    >
      {totalPages > 1 && (
        <nav
          aria-label="Pagination"
          className="flex max-w-full flex-wrap items-center justify-center gap-1.5"
        >
          <button
            type="button"
            onClick={() => onPageChange(current - 1)}
            disabled={current === 1}
            aria-label="Previous page"
            className="inline-flex items-center justify-center w-7 h-7 rounded-full border border-[#1F1109]/[0.18] text-base text-[#5C4631] disabled:opacity-30 disabled:cursor-not-allowed hover:enabled:bg-[#1F1109]/[0.06] transition-colors"
          >
            ‹
          </button>

          {pageList(current, totalPages).map((item, i) =>
            item === "gap" ? (
              <span key={`gap-${i}`} className="px-1 text-xs text-[#5C4631]">
                …
              </span>
            ) : (
              <button
                key={item}
                type="button"
                onClick={() => onPageChange(item)}
                aria-label={`Page ${item}`}
                aria-current={item === current ? "page" : undefined}
                className={`${pageButtonClass} ${
                  item === current
                    ? "bg-[#3D2817] text-[#F4ECDD] font-medium cursor-default"
                    : "text-[#5C4631] hover:bg-[#1F1109]/[0.06]"
                }`}
              >
                {item}
              </button>
            )
          )}

          <button
            type="button"
            onClick={() => onPageChange(current + 1)}
            disabled={current === totalPages}
            aria-label="Next page"
            className="inline-flex items-center justify-center w-7 h-7 rounded-full border border-[#1F1109]/[0.18] text-base text-[#5C4631] disabled:opacity-30 disabled:cursor-not-allowed hover:enabled:bg-[#1F1109]/[0.06] transition-colors"
          >
            ›
          </button>
        </nav>
      )}

      {showPageSize && pageSizeOptions && onPageSizeChange && (
        <label className="inline-flex items-center gap-1.5 text-xs text-[#6B5640]">
          <span className="sr-only">Results per page</span>
          <select
            value={pageSize}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
            className="cursor-pointer rounded-full border border-[#1F1109]/[0.18] bg-transparent py-1 pl-2.5 pr-1 text-xs text-[#5C4631] outline-none"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size} / page
              </option>
            ))}
          </select>
        </label>
      )}
    </div>
  );
};
