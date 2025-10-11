import { Router } from 'express';
import {
  processPageWithAI,
  getPageText,
  getAvailableAIProviders,
  batchProcessProject,
  testAIProcessing,
  uploadTestImage
} from '../controllers/aiController';
import { checkAIRateLimit } from '../middleware/rateLimiter';

const router = Router();

// All routes require authentication except test
router.post('/pages/:pageId/process', checkAIRateLimit, processPageWithAI);
router.get('/pages/:pageId/text', getPageText);
router.get('/providers', getAvailableAIProviders);
router.post('/projects/:projectId/batch-process', checkAIRateLimit, batchProcessProject);
router.post('/test', testAIProcessing); // No auth required for testing
router.post('/upload-test', uploadTestImage); // No auth required for testing

export default router;
