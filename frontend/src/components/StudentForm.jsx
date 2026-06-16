import { useEffect, useState } from 'react';
import { photoUrl } from '../api/client.js';

const EMPTY = {
  name: '',
  course: '',
  year: '',
  date_of_birth: '',
  email: '',
  mobile: '',
  gender: '',
  address: '',
};

// Client-side validation mirroring the backend rules.
function validate(values) {
  const errors = {};
  if (!values.name.trim() || values.name.trim().length < 2) errors.name = 'Name must be at least 2 characters';
  if (!values.course.trim()) errors.course = 'Course is required';
  if (!values.year || values.year < 1 || values.year > 10) errors.year = 'Year must be between 1 and 10';
  if (!values.date_of_birth) errors.date_of_birth = 'Date of birth is required';
  else if (new Date(values.date_of_birth) > new Date()) errors.date_of_birth = 'Date of birth cannot be in the future';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) errors.email = 'A valid email is required';
  if (!/^[+]?[0-9]{10,15}$/.test(values.mobile)) errors.mobile = 'Mobile must be 10-15 digits';
  if (!['Male', 'Female', 'Other'].includes(values.gender)) errors.gender = 'Please select a gender';
  if (!values.address.trim()) errors.address = 'Address is required';
  return errors;
}

export default function StudentForm({ student, onSubmit, onCancel, submitting }) {
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const isEdit = Boolean(student);

  // Populate the form when editing an existing student.
  useEffect(() => {
    if (student) {
      setValues({
        name: student.name || '',
        course: student.course || '',
        year: student.year || '',
        date_of_birth: student.date_of_birth ? student.date_of_birth.slice(0, 10) : '',
        email: student.email || '',
        mobile: student.mobile || '',
        gender: student.gender || '',
        address: student.address || '',
      });
      setPreview(photoUrl(student.photo_path));
    } else {
      setValues(EMPTY);
      setPreview(null);
    }
    setPhoto(null);
    setErrors({});
  }, [student]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
  };

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    const formData = new FormData();
    Object.entries(values).forEach(([k, v]) => formData.append(k, v));
    if (photo) formData.append('photo', photo);
    onSubmit(formData);
  };

  return (
    <form className="card form" onSubmit={handleSubmit} noValidate>
      <h2>{isEdit ? 'Edit Student' : 'Add New Student'}</h2>
      {isEdit && (
        <p className="muted">Admission No: <strong>{student.admission_number}</strong></p>
      )}

      <div className="form-grid">
        <Field label="Full Name" error={errors.name}>
          <input name="name" value={values.name} onChange={handleChange} placeholder="Jane Doe" />
        </Field>

        <Field label="Course" error={errors.course}>
          <input name="course" value={values.course} onChange={handleChange} placeholder="Computer Science" />
        </Field>

        <Field label="Year" error={errors.year}>
          <input type="number" name="year" min="1" max="10" value={values.year} onChange={handleChange} placeholder="1" />
        </Field>

        <Field label="Date of Birth" error={errors.date_of_birth}>
          <input type="date" name="date_of_birth" value={values.date_of_birth} onChange={handleChange} />
        </Field>

        <Field label="Email" error={errors.email}>
          <input type="email" name="email" value={values.email} onChange={handleChange} placeholder="jane@example.com" />
        </Field>

        <Field label="Mobile Number" error={errors.mobile}>
          <input name="mobile" value={values.mobile} onChange={handleChange} placeholder="9876543210" />
        </Field>

        <Field label="Gender" error={errors.gender}>
          <select name="gender" value={values.gender} onChange={handleChange}>
            <option value="">Select…</option>
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>
        </Field>

        <Field label="Student Photo" error={null}>
          <input type="file" accept="image/*" onChange={handlePhoto} />
        </Field>

        <Field label="Address" error={errors.address} full>
          <textarea name="address" rows="2" value={values.address} onChange={handleChange} placeholder="123 Main St, City" />
        </Field>
      </div>

      {preview && (
        <div className="preview">
          <img src={preview} alt="Preview" />
        </div>
      )}

      <div className="form-actions">
        <button type="submit" className="btn primary" disabled={submitting}>
          {submitting ? 'Saving…' : isEdit ? 'Update Student' : 'Add Student'}
        </button>
        {onCancel && (
          <button type="button" className="btn ghost" onClick={onCancel} disabled={submitting}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

function Field({ label, error, children, full }) {
  return (
    <div className={`field ${full ? 'full' : ''}`}>
      <label>{label}</label>
      {children}
      {error && <span className="error-text">{error}</span>}
    </div>
  );
}
