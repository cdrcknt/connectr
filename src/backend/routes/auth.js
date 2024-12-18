import express from 'express';
import { authenticateUser, registerUser, resetPassword } from '../controllers/authController.js'; // Only named imports
import { AuthMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Auth routes
router.post('/register', registerUser);
router.post('/login', authenticateUser);
router.post('/reset-password', resetPassword);

export default router;
