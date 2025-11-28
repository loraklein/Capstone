import { Router } from 'express';
import {
  getProjectPages,
  getPage,
  addPage,
  updatePage,
  updatePageText,
  deletePage,
  reorderPages,
  updatePageReviewStatus,
  getProjectReviewStats
} from '../controllers/pageController';

const router = Router();

// All routes require authentication (we'll add auth middleware later)
router.get('/project/:projectId', getProjectPages);
router.get('/project/:projectId/review-stats', getProjectReviewStats); // Get review statistics
router.get('/:id', getPage);
router.post('/project/:projectId', addPage);
router.put('/:id', updatePage);
router.put('/:id/text', updatePageText); // Update edited text
router.put('/:id/review-status', updatePageReviewStatus); // Update review status
router.delete('/:id', deletePage);
router.put('/project/:projectId/reorder', reorderPages);

export default router;
