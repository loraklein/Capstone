import { Router } from 'express';
import { signUp, signIn, signOut, getCurrentUser } from '../controllers/userController';
import { authenticateUser } from '../middleware/auth';

const router = Router();

// Public auth routes (no authentication required)
router.post('/signup', signUp);
router.post('/signin', signIn);

// Protected auth routes (require authentication)
router.post('/signout', authenticateUser, signOut);
router.get('/me', authenticateUser, getCurrentUser);

export default router;
