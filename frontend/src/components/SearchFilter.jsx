// Search box + dropdown filters. Lifts every change up to the parent which
// owns the query state and triggers a refetch.
export default function SearchFilter({ filters, onChange, onReset }) {
  const update = (key) => (e) => onChange(key, e.target.value);

  return (
    <div className="card filters">
      <input
        className="search"
        type="search"
        placeholder="🔍 Search by name, email or admission no…"
        value={filters.search}
        onChange={update('search')}
      />
      <input
        type="text"
        placeholder="Course"
        value={filters.course}
        onChange={update('course')}
      />
      <select value={filters.year} onChange={update('year')}>
        <option value="">All Years</option>
        {[1, 2, 3, 4, 5, 6].map((y) => (
          <option key={y} value={y}>Year {y}</option>
        ))}
      </select>
      <select value={filters.gender} onChange={update('gender')}>
        <option value="">All Genders</option>
        <option>Male</option>
        <option>Female</option>
        <option>Other</option>
      </select>
      <select value={`${filters.sortBy}:${filters.order}`} onChange={(e) => {
        const [sortBy, order] = e.target.value.split(':');
        onChange('sort', { sortBy, order });
      }}>
        <option value="created_at:desc">Newest first</option>
        <option value="created_at:asc">Oldest first</option>
        <option value="name:asc">Name A→Z</option>
        <option value="name:desc">Name Z→A</option>
        <option value="year:asc">Year ↑</option>
        <option value="year:desc">Year ↓</option>
      </select>
      <button className="btn ghost" onClick={onReset}>Reset</button>
    </div>
  );
}
