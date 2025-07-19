import { Router } from 'express';
import {
  getBuilds,
  getBuild,
  createBuildHandler,
  updateBuildHandler,
  deleteBuildHandler,
  likeBuildHandler,
  favoriteBuildHandler,
  getFavoritesHandler,
  cloneBuildHandler,
  getPopularBuildsHandler,
  getPopularTagsHandler,
  getBuildsByTagHandler
} from '../controllers/build.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', getBuilds);
router.get('/:id', getBuild);
router.post('/', authMiddleware, createBuildHandler);
router.put('/:id', authMiddleware, updateBuildHandler);
router.delete('/:id', authMiddleware, deleteBuildHandler);
router.post('/:id/clone', authMiddleware, cloneBuildHandler);
router.get('/popular', getPopularBuildsHandler);
router.post('/:id/like', authMiddleware, likeBuildHandler);
router.post('/:id/favorite', authMiddleware, favoriteBuildHandler);
router.get('/favorites', authMiddleware, getFavoritesHandler);
router.get('/tags/popular', getPopularTagsHandler);
router.get('/tags/:tag', getBuildsByTagHandler);



export default router;
