import { Router } from 'express';
import {
  getProjectPages,
  addPage,
  updatePage,
  deletePage,
  reorderPages
} from '../controllers/pageController';

const router = Router();

// All routes require authentication (we'll add auth middleware later)
router.get('/project/:projectId', getProjectPages);
router.post('/project/:projectId', addPage);
router.put('/:id', updatePage);
router.delete('/:id', deletePage);
router.put('/project/:projectId/reorder', reorderPages);

export default router;
