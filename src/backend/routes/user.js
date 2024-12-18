import express from 'express';
import { AuthMiddleware } from '../middleware/auth.js'; // Using the middleware to protect routes
import { getUserById, updateUser, deleteUser } from '../controllers/userController.js';

const router = express.Router();

// User routes
// Protect these routes with Firebase authentication middleware
router.get('/:id', AuthMiddleware.verifyFirebaseToken, getUserById);
router.put('/:id', AuthMiddleware.verifyFirebaseToken, updateUser);
router.delete('/:id', AuthMiddleware.verifyFirebaseToken, deleteUser);

export default router;
