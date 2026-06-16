import { photoUrl } from '../api/client.js';

// Renders the students table. Falls back to an avatar placeholder when a
// student has no photo. Shows polished loading / empty states.
export default function StudentList({ students, loading, onEdit, onDelete, onAdd }) {
  if (loading) {
    return (
      <div className="card">
        <div className="state">
          <div className="spinner" />
          <span>Loading students…</span>
        </div>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="card">
        <div className="state">
          <span className="emoji">📭</span>
          <strong>No students found</strong>
          <span className="muted">Try adjusting your filters, or add a new student.</span>
          {onAdd && <button className="btn primary" onClick={onAdd} style={{ marginTop: '0.5rem' }}>＋ Add Student</button>}
        </div>
      </div>
    );
  }

  return (
    <div className="card flush table-wrap">
      <table className="students-table">
        <thead>
          <tr>
            <th>Student</th>
            <th>Admission No</th>
            <th>Course</th>
            <th>Year</th>
            <th>Mobile</th>
            <th>Gender</th>
            <th style={{ textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s) => (
            <tr key={s.id}>
              <td data-label="Student">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                  {s.photo_path ? (
                    <img className="avatar" src={photoUrl(s.photo_path)} alt={s.name} />
                  ) : (
                    <span className="avatar placeholder">{s.name.charAt(0).toUpperCase()}</span>
                  )}
                  <span className="cell-name">
                    <strong>{s.name}</strong>
                    <small>{s.email}</small>
                  </span>
                </div>
              </td>
              <td data-label="Admission No"><span className="mono">{s.admission_number}</span></td>
              <td data-label="Course">{s.course}</td>
              <td data-label="Year"><span className="badge">Year {s.year}</span></td>
              <td data-label="Mobile">{s.mobile}</td>
              <td data-label="Gender"><span className="badge gray">{s.gender}</span></td>
              <td data-label="Actions">
                <div className="row-actions">
                  <button className="btn small" onClick={() => onEdit(s)}>Edit</button>
                  <button className="btn small danger" onClick={() => onDelete(s)}>Drop</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
