import { Router } from 'express';
import {
  spendingByCategory,
  spendingOverTime,
  incomeVsExpenses,
  allTransactions,
} from '../controllers/visualizationController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/spending-by-category', spendingByCategory);
router.get('/spending-over-time', spendingOverTime);
router.get('/income-vs-expenses', incomeVsExpenses);
router.get('/transactions', allTransactions);

export default router;
