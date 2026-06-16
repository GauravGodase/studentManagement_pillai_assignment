import { Router } from 'express';
import {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
} from '../controllers/studentController.js';
import { upload } from '../middleware/upload.js';
import { studentValidationRules, handleValidation } from '../middleware/validate.js';

const router = Router();

router.get('/', getStudents);
router.get('/:id', getStudentById);

// `photo` is the multipart field name for the uploaded image.
router.post('/', upload.single('photo'), studentValidationRules(false), handleValidation, createStudent);
router.put('/:id', upload.single('photo'), studentValidationRules(true), handleValidation, updateStudent);

router.delete('/:id', deleteStudent);

export default router;
