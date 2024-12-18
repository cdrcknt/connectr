import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { UserProfileService } from './services/user-service.js';
import { ConnectionService } from './services/connection-service.js';
import { MoodTrackerService } from './services/mood-service.js';
import { auth, googleProvider } from "./firebaseConfig.js";

class ConnectrApp {
    constructor() {
        this.firebaseConfig = {
            apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
            authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
            projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
            // Other config details
        };

        this.initializeServices();
        this.setupAuthStateListener();
    }

    initializeServices() {
        // Initialize Firebase services
        this.firebaseApp = initializeApp(this.firebaseConfig);
        this.auth = getAuth(this.firebaseApp);
        this.db = getFirestore(this.firebaseApp);

        // Initialize core services
        this.userService = new UserProfileService(this.db);
        this.connectionService = new ConnectionService(this.db);
        this.moodService = new MoodTrackerService(this.db);
    }

    setupAuthStateListener() {
        onAuthStateChanged(this.auth, async (user) => {
            if (user) {
                console.log('User authenticated:', user.uid);
                await this.initializeUserSession(user);
            } else {
                this.handleUserLogout();
            }
        });
    }

    async initializeUserSession(user) {
        try {
            // Load user profile
            const userProfile = await this.userService.getUserProfile(user.uid);
            
            // Initialize user-specific services
            this.connectionService.setCurrentUser(user.uid);
            this.moodService.setCurrentUser(user.uid);

            // Trigger initial data load
            await Promise.all([
                this.connectionService.loadNearbyConnections(),
                this.moodService.loadRecentMoods()
            ]);

        } catch (error) {
            console.error('Session initialization error:', error);
        }
    }

    handleUserLogout() {
        // Reset all services
        this.connectionService.reset();
        this.moodService.reset();
        
        // Redirect to login page
        window.location.href = '/login';
    }

    // Additional app-wide utility methods
    static handleError(error, context = 'General') {
        console.error(`[${context}] Error:`, error);
        // Implement global error handling UI
    }
}

// Initialize app on load
document.addEventListener('DOMContentLoaded', () => {
    window.ConnectrApp = new ConnectrApp();
});

export default ConnectrApp;