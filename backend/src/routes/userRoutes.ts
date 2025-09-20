import { Router } from 'express';
import { createTestUser, getTestUser, getTestUserByEmail } from '../controllers/userController';

const router = Router();

// Test user routes (no auth required for testing)
router.post('/test', createTestUser);
router.get('/test/:id', getTestUser);
router.get('/test/email/:email', getTestUserByEmail);

export default router;
