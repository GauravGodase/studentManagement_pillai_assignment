import multer from 'multer';

// 404 for unmatched routes.
export const notFound = (req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
};

// Centralised error handler. Translates known errors into friendly responses.
// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, _req, res, _next) => {
  console.error('Error:', err.message);

  // Multer (file upload) errors.
  if (err instanceof multer.MulterError) {
    const msg = err.code === 'LIMIT_FILE_SIZE' ? 'Photo must be 2MB or smaller' : err.message;
    return res.status(400).json({ message: msg });
  }

  // Postgres unique-violation -> 409 Conflict.
  if (err.code === '23505') {
    const field = err.detail?.match(/\((.*?)\)/)?.[1] || 'field';
    return res.status(409).json({ message: `A student with this ${field} already exists` });
  }

  // Invalid image type thrown from the multer fileFilter.
  if (/images are allowed/i.test(err.message)) {
    return res.status(400).json({ message: err.message });
  }

  res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
};
