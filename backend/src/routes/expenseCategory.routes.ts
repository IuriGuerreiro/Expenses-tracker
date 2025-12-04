import { Router } from 'express';
import { body } from 'express-validator';
import { create, getAll, update, remove } from '../controllers/expenseCategoryController';
import { validate } from '../middleware/validation';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

const expenseCategoryValidation = [
  body('name').notEmpty().trim().withMessage('Expense Category name is required'),
];

router.post('/', expenseCategoryValidation, validate, create);
router.get('/', getAll);
router.put('/:id', validate, update);
router.delete('/:id', remove);

export default router;
