import { useCallback, useEffect, useState } from 'react';
import { api } from './api/client.js';
import StudentForm from './components/StudentForm.jsx';
import StudentList from './components/StudentList.jsx';
import SearchFilter from './components/SearchFilter.jsx';
import Pagination from './components/Pagination.jsx';
import Analytics from './components/Analytics.jsx';

const DEFAULT_FILTERS = {
  search: '',
  course: '',
  year: '',
  gender: '',
  sortBy: 'created_at',
  order: 'desc',
};

export default function App() {
  const [students, setStudents] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState(null); // student pending deletion
  const [toast, setToast] = useState(null);
  const [analytics, setAnalytics] = useState(null);

  const notify = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadStudents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.list({ ...filters, page, limit: 8 });
      setStudents(res.data);
      setPagination(res.pagination);
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  const loadAnalytics = useCallback(async () => {
    try {
      setAnalytics(await api.analytics());
    } catch {
      /* analytics is non-critical */
    }
  }, []);

  // Debounce filter/search changes so we don't fire a request per keystroke.
  useEffect(() => {
    const t = setTimeout(loadStudents, 300);
    return () => clearTimeout(t);
  }, [loadStudents]);

  useEffect(() => { loadAnalytics(); }, [loadAnalytics]);

  const handleFilterChange = (key, value) => {
    setPage(1);
    if (key === 'sort') {
      setFilters((f) => ({ ...f, sortBy: value.sortBy, order: value.order }));
    } else {
      setFilters((f) => ({ ...f, [key]: value }));
    }
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setPage(1);
  };

  const openAdd = () => { setEditing(null); setShowForm(true); };
  const openEdit = (student) => { setEditing(student); setShowForm(true); };
  const closeForm = () => { setShowForm(false); setEditing(null); };

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    try {
      if (editing) {
        await api.update(editing.id, formData);
        notify('Student updated successfully');
      } else {
        await api.create(formData);
        notify('Student added successfully');
      }
      closeForm();
      await Promise.all([loadStudents(), loadAnalytics()]);
    } catch (err) {
      const detail = err.fieldErrors?.length
        ? err.fieldErrors.map((e) => e.message).join(', ')
        : err.message;
      notify(detail, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    const student = confirm;
    setConfirm(null);
    try {
      await api.remove(student.id);
      notify(`Dropped ${student.name}`);
      await Promise.all([loadStudents(), loadAnalytics()]);
    } catch (err) {
      notify(err.message, 'error');
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <h1>🎓 Student Management System</h1>
          <p className="muted">Add, search, update and manage student records.</p>
        </div>
        <button className="btn primary" onClick={openAdd}>+ Add Student</button>
      </header>

      <main>
        <Analytics data={analytics} />

        <SearchFilter filters={filters} onChange={handleFilterChange} onReset={resetFilters} />

        <StudentList
          students={students}
          loading={loading}
          onEdit={openEdit}
          onDelete={setConfirm}
        />

        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          onPage={setPage}
        />
      </main>

      {/* Add / Edit modal */}
      {showForm && (
        <div className="modal-overlay" onClick={closeForm}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <StudentForm
              student={editing}
              onSubmit={handleSubmit}
              onCancel={closeForm}
              submitting={submitting}
            />
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {confirm && (
        <div className="modal-overlay" onClick={() => setConfirm(null)}>
          <div className="modal small" onClick={(e) => e.stopPropagation()}>
            <div className="card">
              <h2>Drop Student?</h2>
              <p>
                Are you sure you want to remove <strong>{confirm.name}</strong> ({confirm.admission_number})?
                This cannot be undone.
              </p>
              <div className="form-actions">
                <button className="btn danger" onClick={handleDelete}>Yes, Drop</button>
                <button className="btn ghost" onClick={() => setConfirm(null)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && <div className={`toast ${toast.type}`}>{toast.message}</div>}
    </div>
  );
}
