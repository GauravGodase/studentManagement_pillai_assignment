import { unlink } from 'node:fs/promises';
import { join } from 'node:path';
import pool, { query } from '../db/pool.js';
import { generateAdmissionNumber } from '../utils/admissionNumber.js';
import { uploadDir } from '../middleware/upload.js';

// Columns a client is allowed to set on a student.
const EDITABLE_FIELDS = [
  'name', 'course', 'year', 'date_of_birth',
  'email', 'mobile', 'gender', 'address',
];

// Writes a row into activity_logs. Never throws — logging must not break CRUD.
async function logActivity(client, studentId, action, details) {
  try {
    await (client || pool).query(
      'INSERT INTO activity_logs (student_id, action, details) VALUES ($1, $2, $3)',
      [studentId, action, details]
    );
  } catch (err) {
    console.error('Activity log failed:', err.message);
  }
}

// Best-effort removal of an uploaded photo file.
async function removePhoto(photoPath) {
  if (!photoPath) return;
  try {
    await unlink(join(uploadDir, photoPath.split('/').pop()));
  } catch {
    /* file already gone — ignore */
  }
}

// GET /students  — list with search, filter, sort, server-side pagination.
export async function getStudents(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const offset = (page - 1) * limit;

    const where = [];
    const params = [];

    // Free-text search across name, email and admission number.
    if (req.query.search) {
      params.push(`%${req.query.search.toLowerCase()}%`);
      const i = params.length;
      where.push(
        `(LOWER(name) LIKE $${i} OR LOWER(email) LIKE $${i} OR LOWER(admission_number) LIKE $${i})`
      );
    }
    if (req.query.course) {
      params.push(req.query.course);
      where.push(`course = $${params.length}`);
    }
    if (req.query.year) {
      params.push(parseInt(req.query.year, 10));
      where.push(`year = $${params.length}`);
    }
    if (req.query.gender) {
      params.push(req.query.gender);
      where.push(`gender = $${params.length}`);
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    // Whitelist sort columns to avoid SQL injection via query params.
    const sortable = ['name', 'year', 'course', 'admission_number', 'created_at'];
    const sortBy = sortable.includes(req.query.sortBy) ? req.query.sortBy : 'created_at';
    const order = req.query.order?.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    const countResult = await query(`SELECT COUNT(*) FROM students ${whereSql}`, params);
    const total = parseInt(countResult.rows[0].count, 10);

    params.push(limit, offset);
    const dataResult = await query(
      `SELECT * FROM students ${whereSql}
        ORDER BY ${sortBy} ${order}
        LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    res.json({
      data: dataResult.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (err) {
    next(err);
  }
}

// GET /students/:id
export async function getStudentById(req, res, next) {
  try {
    const { rows } = await query('SELECT * FROM students WHERE id = $1', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

// POST /students  — creates a student with an auto-generated admission number.
export async function createStudent(req, res, next) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const admissionNumber = await generateAdmissionNumber(client);
    const photoPath = req.file ? `/uploads/${req.file.filename}` : null;

    const { name, course, year, date_of_birth, email, mobile, gender, address } = req.body;

    const { rows } = await client.query(
      `INSERT INTO students
         (admission_number, name, course, year, date_of_birth, email, mobile, gender, address, photo_path)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING *`,
      [admissionNumber, name, course, year, date_of_birth, email, mobile, gender, address, photoPath]
    );

    await logActivity(client, rows[0].id, 'CREATE', `Created student ${admissionNumber}`);
    await client.query('COMMIT');

    res.status(201).json(rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    // If the DB insert failed, drop the orphaned upload.
    if (req.file) await removePhoto(`/uploads/${req.file.filename}`);
    next(err);
  } finally {
    client.release();
  }
}

// PUT /students/:id  — partial update; only provided fields change.
export async function updateStudent(req, res, next) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const existing = await client.query('SELECT * FROM students WHERE id = $1', [req.params.id]);
    if (existing.rows.length === 0) {
      await client.query('ROLLBACK');
      if (req.file) await removePhoto(`/uploads/${req.file.filename}`);
      return res.status(404).json({ message: 'Student not found' });
    }

    const updates = [];
    const params = [];

    for (const field of EDITABLE_FIELDS) {
      if (req.body[field] !== undefined) {
        params.push(req.body[field]);
        updates.push(`${field} = $${params.length}`);
      }
    }

    // A new photo replaces the old one (old file removed after commit).
    const oldPhoto = existing.rows[0].photo_path;
    let newPhoto = null;
    if (req.file) {
      newPhoto = `/uploads/${req.file.filename}`;
      params.push(newPhoto);
      updates.push(`photo_path = $${params.length}`);
    }

    if (updates.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'No valid fields provided to update' });
    }

    params.push(req.params.id);
    const { rows } = await client.query(
      `UPDATE students SET ${updates.join(', ')} WHERE id = $${params.length} RETURNING *`,
      params
    );

    await logActivity(client, rows[0].id, 'UPDATE', `Updated student ${rows[0].admission_number}`);
    await client.query('COMMIT');

    if (newPhoto && oldPhoto) await removePhoto(oldPhoto);
    res.json(rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    if (req.file) await removePhoto(`/uploads/${req.file.filename}`);
    next(err);
  } finally {
    client.release();
  }
}

// DELETE /students/:id
export async function deleteStudent(req, res, next) {
  try {
    const { rows } = await query('DELETE FROM students WHERE id = $1 RETURNING *', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }
    await removePhoto(rows[0].photo_path);
    await logActivity(null, null, 'DELETE', `Deleted student ${rows[0].admission_number}`);
    res.json({ message: 'Student deleted successfully', student: rows[0] });
  } catch (err) {
    next(err);
  }
}
