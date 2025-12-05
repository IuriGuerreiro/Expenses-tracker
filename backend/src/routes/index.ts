import { Router } from 'express';
import authRoutes from './auth.routes';
import accountRoutes from './account.routes';
import expenseCategoryRoutes from './expenseCategory.routes';
import incomeRoutes from './income.routes';
import expenseRoutes from './expense.routes';
import dashboardRoutes from './dashboard.routes';
import visualizationRoutes from './visualization.routes';
import debtRoutes from './debts';
import settingsRoutes from './settings.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/accounts', accountRoutes); // Changed from categories
router.use('/expense-categories', expenseCategoryRoutes); // New route
router.use('/income', incomeRoutes);
router.use('/expenses', expenseRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/visualizations', visualizationRoutes);
router.use('/debts', debtRoutes);
router.use('/settings', settingsRoutes);

export default router;