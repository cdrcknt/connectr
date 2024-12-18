// src/backend/controllers/userController.js
import { getFirestore } from 'firebase-admin/firestore'; // Import Firestore
import admin from '../config/firebase-admin-init.js';


// Initialize Firestore and Auth
const db = getFirestore();

export const getUserById = async (req, res) => {
    try {
        const userId = req.params.id;
        // Retrieve user data from Firestore using the user ID
        const userDoc = await db.collection('users').doc(userId).get();

        if (!userDoc.exists) {
            return res.status(404).json({ error: 'User not found' });
        }

        const userData = userDoc.data();
        return res.status(200).json({ id: userId, ...userData });
    } catch (error) {
        return res.status(500).json({ error: 'Error fetching user data' });
    }
};

export const updateUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const { name, email } = req.body;

        // Validate user input
        if (!name || !email) {
            return res.status(400).json({ error: 'Name and email are required' });
        }

        // Update the user's data in Firestore
        const userRef = db.collection('users').doc(userId);
        await userRef.update({ name, email });

        return res.status(200).json({ message: 'User updated successfully', id: userId, name, email });
    } catch (error) {
        return res.status(500).json({ error: 'Error updating user data' });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;
        
        // Delete user data from Firestore
        const userRef = db.collection('users').doc(userId);
        await userRef.delete();

        // Optionally, delete user from Firebase Authentication
        await getAuth().deleteUser(userId);

        return res.status(200).json({ message: `User ${userId} deleted` });
    } catch (error) {
        return res.status(500).json({ error: 'Error deleting user data' });
    }
};
