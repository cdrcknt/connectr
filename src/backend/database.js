// src/backend/database.js
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';
import firebaseAdmin from './config/firebase-admin-init.js';  // Changed name and added .js extension

const db = firebaseAdmin.firestore();

// Database connection class
class DatabaseConnection {
    constructor() {
        this.connection = null;
    }

    async connect() {
        try {
            console.log('Firebase connected successfully');
            return db;
        } catch (error) {
            console.error('Error connecting to Firebase:', error);
            process.exit(1);
        }
    }

    async disconnect() {
        // Firebase doesn't need to be explicitly disconnected
        console.log('Firebase disconnected');
    }

    static getInstance() {
        if (!this.instance) {
            this.instance = new DatabaseConnection();
        }
        return this.instance;
    }
}

export const connectToDatabase = async () => {
    const dbConnection = DatabaseConnection.getInstance();
    return await dbConnection.connect();
};

export default DatabaseConnection;