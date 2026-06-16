# 🎓 Student Management System

A full-stack **Student Management System** built as a technical assessment. It lets you add, view, search, update and delete (drop) student records, with photo uploads and an auto-generated unique admission number for every student.

---

## 🧰 Technologies Used

| Layer       | Technology                                   |
| ----------- | -------------------------------------------- |
| Frontend    | React 18 + Vite                              |
| Backend     | Node.js + Express.js                         |
| Database    | PostgreSQL                                   |
| File upload | Multer (local disk storage)                  |
| Validation  | express-validator (backend) + custom (frontend) |
| Config      | dotenv (environment variables)               |

---

## ✨ Features

### Core
- ➕ **Add Student** — Name, Course, Year, Date of Birth, Email, Mobile, Gender, Address, Photo
- 🖼️ **Photo upload & storage** — stored on disk, path saved in the DB
- ✏️ **Edit / Update** student details (partial updates supported)
- 📋 **View Student List** in a responsive table
- 🗑️ **Drop (Delete)** a student (with confirmation)
- ✅ **Validation** on both frontend and backend
- 📱 **Responsive UI** (table collapses to cards on mobile)
- 🔢 **Auto-generated, unique Admission Number** (`ADM<YEAR><6-digit-seq>`, e.g. `ADM2026000001`)

### Bonus
- 🔍 **Search** (name / email / admission no) + **filters** (course, year, gender) + sorting
- 📄 **Server-side pagination**
- 📊 **Analytics dashboard** (totals, counts by course/year/gender)
- 📝 **Activity logging** (CREATE / UPDATE / DELETE events stored in DB)
- ⚡ **Database indexes** on searchable/filterable columns
- 🔐 **Environment variables** for all configuration

---

## 📁 Project Structure

```
bits assgnment/
├── backend/
│   ├── src/
│   │   ├── index.js              # Express app entry
│   │   ├── db/
│   │   │   ├── pool.js           # PostgreSQL connection pool
│   │   │   ├── schema.sql        # Tables, indexes, triggers
│   │   │   └── init.js           # Applies schema.sql
│   │   ├── controllers/          # Business logic
│   │   ├── routes/               # Express routers
│   │   ├── middleware/           # upload, validation, error handling
│   │   └── utils/                # admission number generator
│   ├── uploads/                  # Stored student photos
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── App.jsx               # Main app + state
    │   ├── api/client.js         # Fetch wrapper
    │   ├── components/           # Form, List, Filters, Pagination, Analytics
    │   └── styles/index.css
    └── .env.example
```

---

## 🚀 Setup Instructions

### Prerequisites
- **Node.js** ≥ 18
- **PostgreSQL** ≥ 13 running locally (or a hosted instance / connection string)

### 1. Database

Create the database (the schema/tables are created automatically in the next step):

```bash
createdb student_management
# or inside psql:  CREATE DATABASE student_management;
```

### 2. Backend

```bash
cd backend
cp .env.example .env          # then edit DB credentials in .env
npm install
npm run db:init               # creates tables, indexes & triggers
npm run dev                   # starts API on http://localhost:5000
```

### 3. Frontend

```bash
cd frontend
cp .env.example .env          # optional; leave VITE_API_URL empty for local dev
npm install
npm run dev                   # opens http://localhost:5173
```

The Vite dev server proxies `/api` and `/uploads` to the backend, so no extra
CORS setup is needed in development.

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)
| Variable        | Description                              | Default                 |
| --------------- | ---------------------------------------- | ----------------------- |
| `PORT`          | API port                                 | `5000`                  |
| `CLIENT_ORIGIN` | Allowed CORS origin                      | `http://localhost:5173` |
| `PGHOST`        | Postgres host                            | `localhost`             |
| `PGPORT`        | Postgres port                            | `5432`                  |
| `PGUSER`        | Postgres user                            | `postgres`              |
| `PGPASSWORD`    | Postgres password                        | `postgres`              |
| `PGDATABASE`    | Database name                            | `student_management`    |
| `DATABASE_URL`  | Full connection string (overrides PG\*)  | —                       |
| `UPLOAD_DIR`    | Photo storage folder                     | `uploads`               |

### Frontend (`frontend/.env`)
| Variable       | Description                                       | Default |
| -------------- | ------------------------------------------------- | ------- |
| `VITE_API_URL` | Backend base URL (empty = use dev proxy)          | —       |

---

## 🔌 API Endpoints

Base URL: `http://localhost:5000/api`

### Students
| Method   | Endpoint         | Description                                  |
| -------- | ---------------- | -------------------------------------------- |
| `GET`    | `/students`      | List students (supports query params below)  |
| `GET`    | `/students/:id`  | Get a single student                         |
| `POST`   | `/students`      | Create a student (`multipart/form-data`)     |
| `PUT`    | `/students/:id`  | Update a student (`multipart/form-data`)     |
| `DELETE` | `/students/:id`  | Delete (drop) a student                      |

**Query params for `GET /students`:**
`search`, `course`, `year`, `gender`, `sortBy` (`name|year|course|admission_number|created_at`), `order` (`asc|desc`), `page`, `limit`.

Example:
```
GET /api/students?search=jane&year=2&sortBy=name&order=asc&page=1&limit=8
```

Response shape:
```json
{
  "data": [ /* student objects */ ],
  "pagination": { "page": 1, "limit": 8, "total": 25, "totalPages": 4 }
}
```

### Analytics
| Method | Endpoint     | Description                          |
| ------ | ------------ | ------------------------------------ |
| `GET`  | `/analytics` | Totals & breakdowns + recent activity |

### Health
| Method | Endpoint      | Description     |
| ------ | ------------- | --------------- |
| `GET`  | `/api/health` | Service status  |

> **Note:** Admission Number is **not** accepted from the client — it is
> auto-generated server-side inside a transaction to guarantee uniqueness.

---

## 🗄️ Database Schema (summary)

**`students`**
- `id` (PK), `admission_number` (UNIQUE), `name`, `course`, `year`,
  `date_of_birth`, `email` (UNIQUE), `mobile`, `gender` (enum),
  `address`, `photo_path`, `created_at`, `updated_at`
- Indexes on admission_number, name, course, year, gender, created_at
- Trigger auto-updates `updated_at` on every row change

**`activity_logs`**
- `id` (PK), `student_id` (FK), `action`, `details`, `created_at`

See [backend/src/db/schema.sql](backend/src/db/schema.sql) for the full DDL.

---

## 🌐 Sample cURL

```bash
# Create a student (multipart form with optional photo)
curl -X POST http://localhost:5000/api/students \
  -F "name=Jane Doe" -F "course=Computer Science" -F "year=2" \
  -F "date_of_birth=2003-05-14" -F "email=jane@example.com" \
  -F "mobile=9876543210" -F "gender=Female" -F "address=123 Main St" \
  -F "photo=@/path/to/photo.jpg"

# List students
curl http://localhost:5000/api/students
```

---

## 📦 Production Build

```bash
cd frontend && npm run build      # outputs to frontend/dist
cd backend  && npm start          # serves the API
```

Host the `frontend/dist` static files on any static host (Netlify, Vercel,
Render static, etc.) and deploy the backend on a Node host with a PostgreSQL
add-on, then set `VITE_API_URL` (frontend) and the `PG*`/`DATABASE_URL`
(backend) environment variables accordingly.

---

## 📝 License

MIT — created for a technical assessment.
