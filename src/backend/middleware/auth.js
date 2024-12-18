import jwt from 'jsonwebtoken';
import { getAuth } from 'firebase-admin/auth';

export class AuthMiddleware {
    static async verifyFirebaseToken(req, res, next) {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ error: 'No token provided' });
        }

        try {
            const token = authHeader.split(' ')[1];
            const decodedToken = await getAuth().verifyIdToken(token);
            
            req.user = {
                uid: decodedToken.uid,
                email: decodedToken.email
            };
            
            next();
        } catch (error) {
            res.status(403).json({ error: 'Unauthorized access' });
        }
    }

    static generateJWTToken(user) {
        return jwt.sign(
            { 
                uid: user.uid, 
                email: user.email 
            }, 
            process.env.JWT_SECRET, 
            { expiresIn: '24h' }
        );
    }

    static validateJWTToken(token) {
        try {
            return jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            return null;
        }
    }
}

export default AuthMiddleware;