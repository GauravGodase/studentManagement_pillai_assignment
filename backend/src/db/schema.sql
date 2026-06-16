-- ============================================================
-- Student Management System - Database Schema
-- ============================================================

-- Enum for gender keeps the data consistent at the DB level.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'gender_type') THEN
        CREATE TYPE gender_type AS ENUM ('Male', 'Female', 'Other');
    END IF;
END$$;

-- ------------------------------------------------------------
-- students
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS students (
    id               SERIAL PRIMARY KEY,
    admission_number VARCHAR(20)  NOT NULL UNIQUE,
    name             VARCHAR(120) NOT NULL,
    course           VARCHAR(120) NOT NULL,
    year             SMALLINT     NOT NULL CHECK (year BETWEEN 1 AND 10),
    date_of_birth    DATE         NOT NULL,
    email            VARCHAR(160) NOT NULL UNIQUE,
    mobile           VARCHAR(15)  NOT NULL,
    gender           gender_type  NOT NULL,
    address          TEXT         NOT NULL,
    photo_path       VARCHAR(255),
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Indexes to speed up search / filter / sort (bonus requirement).
CREATE UNIQUE INDEX IF NOT EXISTS idx_students_admission_number ON students (admission_number);
CREATE INDEX IF NOT EXISTS idx_students_name    ON students (LOWER(name));
CREATE INDEX IF NOT EXISTS idx_students_course  ON students (course);
CREATE INDEX IF NOT EXISTS idx_students_year    ON students (year);
CREATE INDEX IF NOT EXISTS idx_students_gender  ON students (gender);
CREATE INDEX IF NOT EXISTS idx_students_created ON students (created_at DESC);

-- ------------------------------------------------------------
-- activity_logs  (bonus: activity logging)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS activity_logs (
    id          SERIAL PRIMARY KEY,
    student_id  INTEGER REFERENCES students(id) ON DELETE SET NULL,
    action      VARCHAR(20) NOT NULL,           -- CREATE | UPDATE | DELETE
    details     TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON activity_logs (created_at DESC);

-- ------------------------------------------------------------
-- Auto-update updated_at on every UPDATE.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_students_updated_at ON students;
CREATE TRIGGER trg_students_updated_at
    BEFORE UPDATE ON students
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();
