import crypto from 'crypto';

class EncryptionService {
    constructor() {
        this.algorithm = 'aes-256-cbc';
        this.key = crypto.scryptSync(
            process.env.ENCRYPTION_KEY, 
            'salt', 
            32
        );
        this.iv = crypto.randomBytes(16);
    }

    // Encrypt data
    encrypt(data) {
        try {
            const cipher = crypto.createCipheriv(this.algorithm, this.key, this.iv);
            let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
            encrypted += cipher.final('hex');
            return {
                iv: this.iv.toString('hex'),
                content: encrypted
            };
        } catch (error) {
            console.error('Encryption error:', error);
            throw new Error('Encryption failed');
        }
    }

    // Decrypt data
    decrypt(encryptedData) {
        try {
            const decipher = crypto.createDecipheriv(
                this.algorithm, 
                this.key, 
                Buffer.from(encryptedData.iv, 'hex')
            );
            
            let decrypted = decipher.update(encryptedData.content, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            
            return JSON.parse(decrypted);
        } catch (error) {
            console.error('Decryption error:', error);
            throw new Error('Decryption failed');
        }
    }

    // Generate secure random token
    generateSecureToken(length = 32) {
        return crypto.randomBytes(length).toString('hex');
    }

    // Hash password
    hashPassword(password) {
        return crypto.pbkdf2Sync(
            password, 
            process.env.SALT, 
            1000, 
            64, 
            'sha512'
        ).toString('hex');
    }

    // Verify password
    verifyPassword(inputPassword, storedHash) {
        const hashedInput = this.hashPassword(inputPassword);
        return crypto.timingSafeEqual(
            Buffer.from(hashedInput), 
            Buffer.from(storedHash)
        );
    }
}

export default new EncryptionService();