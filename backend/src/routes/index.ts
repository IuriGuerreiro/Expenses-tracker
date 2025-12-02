import { Router } from 'express';
import authRoutes from './auth.routes';
import categoryRoutes from './category.routes';
import incomeRoutes from './income.routes';
import expenseRoutes from './expense.routes';
import dashboardRoutes from './dashboard.routes';
import visualizationRoutes from './visualization.routes';
import debtRoutes from './debts';

const router = Router();

router.use('/auth', authRoutes);
router.use('/categories', categoryRoutes);
router.use('/income', incomeRoutes);
router.use('/expenses', expenseRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/visualizations', visualizationRoutes);
router.use('/debts', debtRoutes);

export default router;
