import { Router } from 'express';
import { MatchController } from './match.controller';

const router = Router();

router.get('/', MatchController.getAll);
router.get('/:id', MatchController.getById);

export default router;
