import { Router } from 'express';
import { getArmor } from '../controllers/armor.controller';

const router = Router();
router.get('/', getArmor);

export default router;
