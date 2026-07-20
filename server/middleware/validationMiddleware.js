import { validationResult } from 'express-validator';

// Intercepts request flow and returns detailed errors if any validation rules fail
export const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorArray = errors.array().map((err) => {
      // In express-validator v7+, err.path contains the field name
      const field = err.type === 'field' ? err.path : 'general';
      return {
        field,
        message: err.msg,
      };
    });

    return res.status(400).json({
      success: false,
      message: 'Request validation failed',
      errors: errorArray,
    });
  }
  next();
};
