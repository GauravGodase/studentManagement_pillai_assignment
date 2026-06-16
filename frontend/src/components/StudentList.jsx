import { photoUrl } from '../api/client.js';

// Renders the students table. Falls back to an avatar placeholder when a
// student has no photo.
export default function StudentList({ students, loading, onEdit, onDelete }) {
  if (loading) {
    return <div className="card center muted">Loading students…</div>;
  }
  if (students.length === 0) {
    return <div className="card center muted">No students found.</div>;
  }

  return (
    <div className="card table-wrap">
      <table className="students-table">
        <thead>
          <tr>
            <th>Photo</th>
            <th>Admission No</th>
            <th>Name</th>
            <th>Course</th>
            <th>Year</th>
            <th>Email</th>
            <th>Mobile</th>
            <th>Gender</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s) => (
            <tr key={s.id}>
              <td data-label="Photo">
                {s.photo_path ? (
                  <img className="avatar" src={photoUrl(s.photo_path)} alt={s.name} />
                ) : (
                  <span className="avatar placeholder">{s.name.charAt(0).toUpperCase()}</span>
                )}
              </td>
              <td data-label="Admission No"><code>{s.admission_number}</code></td>
              <td data-label="Name">{s.name}</td>
              <td data-label="Course">{s.course}</td>
              <td data-label="Year">{s.year}</td>
              <td data-label="Email">{s.email}</td>
              <td data-label="Mobile">{s.mobile}</td>
              <td data-label="Gender">{s.gender}</td>
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
