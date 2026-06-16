// Generates a unique admission number in the form ADM<YEAR><SEQ>,
// e.g. ADM2026000001. The sequence is derived from the highest existing
// number for the current year, computed inside the same transaction as the
// insert so concurrent requests can't collide.
export async function generateAdmissionNumber(client) {
  const year = new Date().getFullYear();
  const prefix = `ADM${year}`;

  const { rows } = await client.query(
    `SELECT admission_number
       FROM students
      WHERE admission_number LIKE $1
      ORDER BY admission_number DESC
      LIMIT 1
      FOR UPDATE`,
    [`${prefix}%`]
  );

  let nextSeq = 1;
  if (rows.length > 0) {
    const lastSeq = parseInt(rows[0].admission_number.slice(prefix.length), 10);
    nextSeq = lastSeq + 1;
  }

  return `${prefix}${String(nextSeq).padStart(6, '0')}`;
}
