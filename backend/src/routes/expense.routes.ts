import { Router } from 'express';
import { body } from 'express-validator';
import { create, getAll, update, remove } from '../controllers/expenseController';
import { validate } from '../middleware/validation';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

const expenseValidation = [
  body('categoryId').notEmpty().withMessage('Category is required'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('description').notEmpty().trim().withMessage('Description is required'),
  body('transactionDate').isISO8601().withMessage('Valid transaction date is required'),
];

router.post('/', expenseValidation, validate, create);
router.get('/', getAll);
router.put('/:id', validate, update);
router.delete('/:id', remove);

export default router;
