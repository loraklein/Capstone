import { Router } from 'express';
import {
  processPageWithAI,
  getPageText,
  getAvailableAIProviders,
  batchProcessProject,
  testAIProcessing,
  uploadTestImage
} from '../controllers/aiController';

const router = Router();

// All routes require authentication except test
router.post('/pages/:pageId/process', processPageWithAI);
router.get('/pages/:pageId/text', getPageText);
router.get('/providers', getAvailableAIProviders);
router.post('/projects/:projectId/batch-process', batchProcessProject);
router.post('/test', testAIProcessing); // No auth required for testing
router.post('/upload-test', uploadTestImage); // No auth required for testing

export default router;
