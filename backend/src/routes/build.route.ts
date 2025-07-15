import { Router } from 'express';
import {
  getBuilds,
  getBuild,
  createBuildHandler,
  updateBuildHandler,
  deleteBuildHandler,
} from '../controllers/build.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', getBuilds);
router.get('/:id', getBuild);
router.post('/', authMiddleware, createBuildHandler);
router.patch('/:id', authMiddleware, updateBuildHandler);
router.delete('/:id', authMiddleware, deleteBuildHandler);

export default router;
