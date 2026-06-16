import { query } from '../db/pool.js';

// GET /analytics  — summary stats for the dashboard (bonus).
export async function getAnalytics(_req, res, next) {
  try {
    const [total, byCourse, byYear, byGender, recent] = await Promise.all([
      query('SELECT COUNT(*)::int AS count FROM students'),
      query('SELECT course, COUNT(*)::int AS count FROM students GROUP BY course ORDER BY count DESC'),
      query('SELECT year, COUNT(*)::int AS count FROM students GROUP BY year ORDER BY year'),
      query('SELECT gender, COUNT(*)::int AS count FROM students GROUP BY gender'),
      query(
        `SELECT id, student_id, action, details, created_at
           FROM activity_logs
          ORDER BY created_at DESC
          LIMIT 10`
      ),
    ]);

    res.json({
      totalStudents: total.rows[0].count,
      byCourse: byCourse.rows,
      byYear: byYear.rows,
      byGender: byGender.rows,
      recentActivity: recent.rows,
    });
  } catch (err) {
    next(err);
  }
}
