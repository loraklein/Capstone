import { Router } from 'express';
import {
  getProjectChapters,
  createChapter,
  updateChapter,
  deleteChapter,
  reorderChapters,
  suggestChapters,
  executeReorganization,
} from '../controllers/chapterController';

const router = Router();

// All routes require authentication
router.get('/project/:projectId', getProjectChapters);
router.get('/project/:projectId/suggestions', suggestChapters);
router.post('/project/:projectId', createChapter);
router.post('/project/:projectId/reorganize', executeReorganization);
router.put('/project/:projectId/reorder', reorderChapters);
router.put('/:chapterId', updateChapter);
router.delete('/:chapterId', deleteChapter);

export default router;
