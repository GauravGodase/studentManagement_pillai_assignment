// Server-side pagination controls.
export default function Pagination({ page, totalPages, total, onPage }) {
  if (total === 0) return null;

  return (
    <div className="pagination">
      <span>
        Showing page <strong>{page}</strong> of <strong>{totalPages}</strong> · {total} student{total === 1 ? '' : 's'} total
      </span>
      {totalPages > 1 && (
        <div className="pages">
          <button className="btn small" disabled={page <= 1} onClick={() => onPage(page - 1)}>
            ← Prev
          </button>
          <button className="btn small" disabled={page >= totalPages} onClick={() => onPage(page + 1)}>
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
