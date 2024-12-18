import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signInWithPopup, 
    updateProfile,
    sendPasswordResetEmail
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebaseConfig.js';

class AuthService {
    // Register user with email and password
    static async registerUser(email, password, additionalInfo = {}) {
        try {
            // Validate inputs
            if (!email || !password) {
                throw new Error('Email and password are required');
            }

            // Create user in Firebase Authentication
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Update user profile if additional info provided
            if (additionalInfo.name) {
                await updateProfile(user, { displayName: additionalInfo.name });
            }

            // Create user document in Firestore
            const userDocument = {
                uid: user.uid,
                email: user.email,
                displayName: additionalInfo.name || '',
                createdAt: new Date(),
                lastLogin: new Date(),
                profileComplete: false,
                ...additionalInfo
            };

            await setDoc(doc(db, 'users', user.uid), userDocument);

            return user;
        } catch (error) {
            console.error('Registration Error:', error);
            throw error;
        }
    }

    // Login with email and password
    static async loginWithEmail(email, password) {
        try {
            // Validate inputs
            if (!email || !password) {
                throw new Error('Email and password are required');
            }

            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Update last login timestamp
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, { lastLogin: new Date() });

            return user;
        } catch (error) {
            console.error('Login Error:', error);
            throw error;
        }
    }

    // Google Sign-In
    static async loginWithGoogle() {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

            // Check if user document exists, if not create one
            const userRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userRef);

            if (!userDoc.exists()) {
                await setDoc(userRef, {
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName || '',
                    photoURL: user.photoURL || '',
                    createdAt: new Date(),
                    lastLogin: new Date(),
                    profileComplete: false
                });
            } else {
                // Update last login for existing users
                await updateDoc(userRef, { 
                    lastLogin: new Date(),
                    displayName: user.displayName || userDoc.data().displayName,
                    photoURL: user.photoURL || userDoc.data().photoURL
                });
            }

            return user;
        } catch (error) {
            console.error('Google Login Error:', error);
            throw error;
        }
    }

    // Password Reset
    static async resetPassword(email) {
        try {
            // Validate email
            if (!email) {
                throw new Error('Email is required');
            }

            await sendPasswordResetEmail(auth, email);
            return true;
        } catch (error) {
            console.error('Password Reset Error:', error);
            throw error;
        }
    }

    // Get Current User
    static getCurrentUser() {
        return auth.currentUser;
    }

    // Logout
    static async logout() {
        try {
            await auth.signOut();
        } catch (error) {
            console.error('Logout Error:', error);
            throw error;
        }
    }

    // Fetch User Profile
    static async getUserProfile(uid) {
        try {
            const userRef = doc(db, 'users', uid);
            const userDoc = await getDoc(userRef);

            if (userDoc.exists()) {
                return userDoc.data();
            } else {
                throw new Error('User profile not found');
            }
        } catch (error) {
            console.error('Fetch User Profile Error:', error);
            throw error;
        }
    }

    // Update User Profile
    static async updateUserProfile(uid, updateData) {
        try {
            const userRef = doc(db, 'users', uid);
            await updateDoc(userRef, updateData);
            return true;
        } catch (error) {
            console.error('Update User Profile Error:', error);
            throw error;
        }
    }
}

export default AuthService;