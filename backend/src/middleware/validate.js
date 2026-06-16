import { body, validationResult } from 'express-validator';

// Builds the validation chain for a student payload.
// When isUpdate is true every field becomes optional, but any field that IS
// present is still fully validated (partial updates with PUT).
export const studentValidationRules = (isUpdate = false) => {
  // On create a field must be present; on update it may be omitted.
  const required = (chain, msg) =>
    isUpdate ? chain.optional() : chain.notEmpty().withMessage(msg);

  return [
    required(body('name').trim(), 'Name is required')
      .isLength({ min: 2, max: 120 }).withMessage('Name must be 2-120 characters'),

    required(body('course').trim(), 'Course is required')
      .isLength({ max: 120 }).withMessage('Course must be at most 120 characters'),

    required(body('year'), 'Year is required')
      .isInt({ min: 1, max: 10 }).withMessage('Year must be between 1 and 10'),

    required(body('date_of_birth'), 'Date of birth is required')
      .isISO8601().withMessage('Date of birth must be a valid date (YYYY-MM-DD)'),

    required(body('email').trim(), 'Email is required')
      .isEmail().withMessage('A valid email is required')
      .normalizeEmail(),

    required(body('mobile'), 'Mobile number is required')
      .matches(/^[+]?[0-9]{10,15}$/).withMessage('Mobile must be a valid 10-15 digit number'),

    required(body('gender'), 'Gender is required')
      .isIn(['Male', 'Female', 'Other']).withMessage('Gender must be Male, Female, or Other'),

    required(body('address').trim(), 'Address is required')
      .isLength({ max: 500 }).withMessage('Address must be at most 500 characters'),
  ];
};

// Collects validation errors and returns 422 with a clean payload.
export const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: 'Validation failed',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};
