import { AuthMiddleware } from '../middleware/auth.js';
import { getAuth } from 'firebase-admin/auth';

export const registerUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const userRecord = await getAuth().createUser({
            email,
            password,
        });

        res.status(201).json({ message: 'User created successfully', user: userRecord });
    } catch (error) {
        res.status(500).json({ error: 'Error creating user' });
    }
};

export const authenticateUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await getAuth().getUserByEmail(email);

        // Check if password matches (handle as needed)
        const token = AuthMiddleware.generateJWTToken(user);
        res.status(200).json({ token });
    } catch (error) {
        res.status(400).json({ error: 'Authentication failed' });
    }
};

export const resetPassword = async (req, res) => {
    const { email } = req.body;

    try {
        await getAuth().generatePasswordResetLink(email);
        res.status(200).json({ message: 'Password reset link sent to email' });
    } catch (error) {
        res.status(500).json({ error: 'Error resetting password' });
    }
};
