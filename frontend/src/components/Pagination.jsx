// Server-side pagination controls.
export default function Pagination({ page, totalPages, total, onPage }) {
  if (totalPages <= 1) {
    return <p className="muted center">{total} student{total === 1 ? '' : 's'} total</p>;
  }

  return (
    <div className="pagination">
      <button className="btn small" disabled={page <= 1} onClick={() => onPage(page - 1)}>
        ← Prev
      </button>
      <span>Page {page} of {totalPages} · {total} total</span>
      <button className="btn small" disabled={page >= totalPages} onClick={() => onPage(page + 1)}>
        Next →
      </button>
    </div>
  );
}
