// Compact analytics dashboard shown above the list (bonus feature).
export default function Analytics({ data }) {
  if (!data) return null;

  return (
    <div className="analytics">
      <div className="stat-card">
        <span className="stat-icon">👥</span>
        <div className="stat-body">
          <div className="stat-value">{data.totalStudents}</div>
          <div className="stat-label">Total Students</div>
        </div>
      </div>

      <div className="stat-card">
        <span className="stat-icon violet">📚</span>
        <div className="stat-body">
          <div className="stat-value">{data.byCourse.length}</div>
          <div className="stat-label">Courses</div>
        </div>
      </div>

      <div className="stat-card">
        <span className="stat-icon green">⚧</span>
        <div className="stat-body">
          <div className="stat-label">By Gender</div>
          <div className="chips">
            {data.byGender.length === 0 && <span className="muted">No data</span>}
            {data.byGender.map((g) => (
              <span key={g.gender} className="chip">{g.gender} · {g.count}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="stat-card">
        <span className="stat-icon amber">🏆</span>
        <div className="stat-body">
          <div className="stat-label">Top Courses</div>
          <div className="chips">
            {data.byCourse.length === 0 && <span className="muted">No data</span>}
            {data.byCourse.slice(0, 4).map((c) => (
              <span key={c.course} className="chip">{c.course} · {c.count}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
