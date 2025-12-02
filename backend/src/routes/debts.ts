import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import * as debtController from '../controllers/debtController';

const router = Router();

router.use(authMiddleware);

router.post('/', debtController.create);
router.get('/', debtController.getAll);
router.put('/:id', debtController.update);
router.post('/:id/mark-paid', debtController.markPaid);
router.delete('/:id', debtController.remove);

export default router;
