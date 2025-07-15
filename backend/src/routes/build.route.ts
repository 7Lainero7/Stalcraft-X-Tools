import { Router } from 'express';
import { getBuilds } from '../controllers/build.controller';

const router = Router();
router.get('/', getBuilds);

export default router;
