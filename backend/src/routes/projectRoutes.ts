import { Router } from 'express';
import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  exportProjectBook,
  exportProjectBookHtml,
  exportProjectBookPdf,
} from '../controllers/projectController';

const router = Router();

// All routes require authentication (we'll add auth middleware later)
router.post('/', createProject);
router.get('/', getProjects);
router.get('/:id', getProjectById);
router.get('/:id/export/book', exportProjectBook);
router.get('/:id/export/book/html', exportProjectBookHtml);
router.get('/:id/export/book/pdf', exportProjectBookPdf);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);

export default router;
