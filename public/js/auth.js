import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    signOut,
    GoogleAuthProvider,
    signInWithPopup,
    updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../config/firebase-config.js';
import EncryptionService from './encryption.js';
import Helpers from './helpers.js';

class AuthService {
    // Register user with email and password
    static async registerWithEmail(email, password, additionalInfo = {}) {
        if (!Helpers.validateEmail(email)) {
            throw new Error('Invalid email format');
        }

        try {
            // Create user in Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Update user profile
            if (additionalInfo.name) {
                await updateProfile(user, { displayName: additionalInfo.name });
            }

            // Prepare user document for Firestore
            const userDocument = {
                uid: user.uid,
                email: user.email,
                displayName: additionalInfo.name || '',
                createdAt: new Date(),
                lastLogin: new Date(),
                profileComplete: false,
                ...additionalInfo,
            };

            // Encrypt sensitive information
            const encryptedDocument = EncryptionService.encrypt(userDocument);

            // Save encrypted user data to Firestore
            await setDoc(doc(db, 'users', user.uid), encryptedDocument);

            return user;
        } catch (error) {
            console.error('Error during registration:', error.message);
            throw error;
        }
    }

    // Login user with email and password
    static async loginWithEmail(email, password) {
        if (!Helpers.validateEmail(email)) {
            throw new Error('Invalid email format');
        }

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Update last login in Firestore
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, { lastLogin: new Date() });

            return user;
        } catch (error) {
            console.error('Error during login:', error.message);
            throw error;
        }
    }

    // Login user with Google
    static async loginWithGoogle() {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

            // Check if user already exists in Firestore
            const userRef = doc(db, 'users', user.uid);
            const userSnapshot = await getDoc(userRef);

            if (!userSnapshot.exists()) {
                // New user, save their data
                const userDocument = {
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName || '',
                    createdAt: new Date(),
                    lastLogin: new Date(),
                    profileComplete: false,
                };

                const encryptedDocument = EncryptionService.encrypt(userDocument);
                await setDoc(userRef, encryptedDocument);
            } else {
                // Existing user, update last login
                await updateDoc(userRef, { lastLogin: new Date() });
            }

            return user;
        } catch (error) {
            console.error('Error during Google login:', error.message);
            throw error;
        }
    }

    // Send password reset email
    static async resetPassword(email) {
        if (!Helpers.validateEmail(email)) {
            throw new Error('Invalid email format');
        }

        try {
            await sendPasswordResetEmail(auth, email);
            console.log('Password reset email sent');
        } catch (error) {
            console.error('Error sending password reset email:', error.message);
            throw error;
        }
    }

    // Logout user
    static async logout() {
        try {
            await signOut(auth);
            console.log('User logged out successfully');
        } catch (error) {
            console.error('Error during logout:', error.message);
            throw error;
        }
    }

    // Get user data from Firestore
    static async getUserData(uid) {
        try {
            const userRef = doc(db, 'users', uid);
            const userSnapshot = await getDoc(userRef);

            if (userSnapshot.exists()) {
                const encryptedData = userSnapshot.data();
                return EncryptionService.decrypt(encryptedData);
            } else {
                throw new Error('User data not found');
            }
        } catch (error) {
            console.error('Error fetching user data:', error.message);
            throw error;
        }
    }
}

export default AuthService;
