import { Router } from 'express';
import { getArtefacts } from '../controllers/artefact.controller';

const router = Router();
router.get('/', getArtefacts);

export default router;
