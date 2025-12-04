import { Router } from 'express';
import { body } from 'express-validator';
import { create, getAll, update, remove } from '../controllers/incomeController';
import { validate } from '../middleware/validation';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

const incomeValidation = [
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('sourceDescription')
    .notEmpty()
    .trim()
    .withMessage('Source description is required'),
  body('transactionDate').isISO8601().withMessage('Valid transaction date is required'),
];

router.post('/', incomeValidation, validate, create);
router.get('/', getAll);
router.put('/:id', validate, update);
router.delete('/:id', remove);

export default router;