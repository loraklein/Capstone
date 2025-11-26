import { Router } from 'express';
import {
  getProjectChapters,
  createChapter,
  updateChapter,
  deleteChapter,
  reorderChapters,
} from '../controllers/chapterController';

const router = Router();

// All routes require authentication
router.get('/project/:projectId', getProjectChapters);
router.post('/project/:projectId', createChapter);
router.put('/project/:projectId/reorder', reorderChapters);
router.put('/:chapterId', updateChapter);
router.delete('/:chapterId', deleteChapter);

export default router;
