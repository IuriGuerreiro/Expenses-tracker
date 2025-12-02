import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { ValidationError } from '../utils/errors';

/**
 * Validation middleware to check express-validator results
 * Use after validator chains in routes
 */
export function validate(req: Request, res: Response, next: NextFunction): void {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(err => err.msg).join(', ');
    const validationError = new ValidationError(errorMessages);

    res.status(validationError.statusCode).json({
      success: false,
      error: {
        message: validationError.message,
        code: validationError.code,
      },
    });
    return;
  }

  next();
}
