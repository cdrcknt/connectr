// src/backend/server.js
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { connectToDatabase } from './database.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';

// Initialize dotenv
dotenv.config();

class ConnectrServer {
    constructor() {
        this.app = express();
        this.port = process.env.PORT || 3000;
        
        this.initializeMiddlewares();
        this.setupRoutes();
        this.connectDatabase();
    }

    initializeMiddlewares() {
        // Security Middlewares
        this.app.use(helmet());
        this.app.use(cors({
            origin: ['http://localhost:3000', 'https://connectr.app']
        }));

        // Rate Limiting
        const limiter = rateLimit({
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 100 // limit each IP to 100 requests per windowMs
        });
        this.app.use(limiter);

        // Performance Middlewares
        this.app.use(compression());
        this.app.use(express.json({ limit: '10kb' }));
        this.app.use(express.urlencoded({ extended: true }));
    }

    setupRoutes() {
        this.app.use('/api/auth', authRoutes);
        this.app.use('/api/users', userRoutes);

        // Global Error Handler
        this.app.use((err, req, res, next) => {
            console.error(err.stack);
            res.status(500).json({
                message: 'Something went wrong!',
                error: process.env.NODE_ENV === 'production' ? {} : err.stack
            });
        });
    }

    async connectDatabase() {
        try {
            await connectToDatabase();
            console.log('Database connected successfully');
        } catch (error) {
            console.error('Database connection failed:', error);
            process.exit(1);
        }
    }

    start() {
        this.app.listen(this.port, () => {
            console.log(`Connectr Server running on port ${this.port}`);
        });
    }
}

const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
};

// Initialize and start the server
const server = new ConnectrServer();
server.start();

export default server;
