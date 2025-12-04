import { Router } from 'express';
import { body } from 'express-validator';
import { create, getAll, update, remove } from '../controllers/accountController';
import { validate } from '../middleware/validation';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

const accountValidation = [
  body('name').notEmpty().trim().withMessage('Account name is required'),
  body('allocationPercentage')
    .isInt({ min: 0, max: 100 })
    .withMessage('Allocation percentage must be between 0 and 100'),
];

router.post('/', accountValidation, validate, create);
router.get('/', getAll);
router.put('/:id', validate, update);
router.delete('/:id', remove);

export default router;
