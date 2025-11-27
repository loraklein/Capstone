import { Router } from 'express';
import {
  correctPageText,
  applyCorrection,
  getProviders,
} from '../controllers/textEnhancementController';

const router = Router();

// All routes require authentication
router.get('/providers', getProviders);
router.post('/pages/:pageId/correct', correctPageText);
router.put('/pages/:pageId/apply', applyCorrection);

export default router;
