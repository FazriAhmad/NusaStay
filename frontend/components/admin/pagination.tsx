"use client";

type Props = {
  currentPage: number;
  lastPage: number;
  total: number;
  perPage: number;
  onPageChange: (page: number) => void;
};

const Pagination = ({ currentPage, lastPage, total, perPage, onPageChange }: Props) => {
  if (lastPage <= 1) {
    return total > 0 ? (
      <p className="text-center text-sm text-on-surface-variant" style={{ paddingTop: "1.5rem" }}>
        Menampilkan {total} item
      </p>
    ) : null;
  }

  // Build page numbers: first, ..., current-1, current, current+1, ..., last
  const pages: (number | "ellipsis")[] = [];
  const addPage = (n: number) => {
    if (n < 1 || n > lastPage) return;
    if (pages[pages.length - 1] === n) return;
    pages.push(n);
  };
  addPage(1);
  if (currentPage > 3) pages.push("ellipsis");
  for (let i = currentPage - 1; i <= currentPage + 1; i++) addPage(i);
  if (currentPage < lastPage - 2) pages.push("ellipsis");
  addPage(lastPage);

  const start = (currentPage - 1) * perPage + 1;
  const end = Math.min(currentPage * perPage, total);

  return (
    <div
      className="flex flex-wrap items-center justify-between gap-3"
      style={{ paddingTop: "1.5rem" }}
    >
      <p className="text-sm text-on-surface-variant">
        Menampilkan <span className="font-semibold text-on-surface">{start}–{end}</span> dari{" "}
        <span className="font-semibold text-on-surface">{total}</span>
      </p>
      <nav
        className="flex items-center gap-1"
        aria-label="Pagination"
      >
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-2 rounded-md border border-outline-variant bg-surface-container-lowest text-on-surface disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-container transition"
          aria-label="Previous page"
        >
          <span className="material-symbols-outlined text-base">chevron_left</span>
        </button>

        {pages.map((p, i) =>
          p === "ellipsis" ? (
            <span
              key={`e-${i}`}
              className="px-2 text-on-surface-variant"
            >
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              aria-current={p === currentPage ? "page" : undefined}
              className={`min-w-[2.25rem] px-3 py-2 rounded-md text-sm font-medium transition ${
                p === currentPage
                  ? "bg-secondary text-on-secondary"
                  : "border border-outline-variant bg-surface-container-lowest text-on-surface hover:bg-surface-container"
              }`}
            >
              {p}
            </button>
          )
        )}

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === lastPage}
          className="px-3 py-2 rounded-md border border-outline-variant bg-surface-container-lowest text-on-surface disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-container transition"
          aria-label="Next page"
        >
          <span className="material-symbols-outlined text-base">chevron_right</span>
        </button>
      </nav>
    </div>
  );
};

export default Pagination;
