import { Router } from 'express';
import {
  getBuilds,
  getBuild,
  createBuildHandler,
  updateBuildHandler,
  deleteBuildHandler,
} from '../controllers/build.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import {
  cloneBuildHandler,
  getPopularBuildsHandler,
} from '../controllers/build.controller';

const router = Router();

router.get('/', getBuilds);
router.get('/:id', getBuild);
router.post('/', authMiddleware, createBuildHandler);
router.patch('/:id', authMiddleware, updateBuildHandler);
router.delete('/:id', authMiddleware, deleteBuildHandler);
router.post('/:id/clone', authMiddleware, cloneBuildHandler);
router.get('/popular', getPopularBuildsHandler);


export default router;
