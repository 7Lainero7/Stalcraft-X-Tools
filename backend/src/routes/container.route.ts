import { Router } from 'express';
import { getContainers } from '../controllers/container.controller';

const router = Router();
router.get('/', getContainers);

export default router;
