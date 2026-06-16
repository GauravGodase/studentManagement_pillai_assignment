import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import studentRoutes from './routes/studentRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 5000;

// --- Middleware ---
app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded photos statically at /uploads/<filename>.
app.use('/uploads', express.static(join(__dirname, '..', process.env.UPLOAD_DIR || 'uploads')));

// --- Health check ---
app.get('/api/health', (_req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// --- Routes ---
app.use('/api/students', studentRoutes);
app.use('/api/analytics', analyticsRoutes);

// --- Error handling ---
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

export default app;
