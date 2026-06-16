// Compact analytics dashboard shown above the list (bonus feature).
export default function Analytics({ data }) {
  if (!data) return null;

  return (
    <div className="analytics">
      <div className="stat-card">
        <span className="stat-value">{data.totalStudents}</span>
        <span className="stat-label">Total Students</span>
      </div>
      <div className="stat-card">
        <span className="stat-value">{data.byCourse.length}</span>
        <span className="stat-label">Courses</span>
      </div>
      <div className="stat-card breakdown">
        <span className="stat-label">By Gender</span>
        <div className="chips">
          {data.byGender.length === 0 && <span className="muted">—</span>}
          {data.byGender.map((g) => (
            <span key={g.gender} className="chip">{g.gender}: {g.count}</span>
          ))}
        </div>
      </div>
      <div className="stat-card breakdown">
        <span className="stat-label">Top Courses</span>
        <div className="chips">
          {data.byCourse.length === 0 && <span className="muted">—</span>}
          {data.byCourse.slice(0, 4).map((c) => (
            <span key={c.course} className="chip">{c.course}: {c.count}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
