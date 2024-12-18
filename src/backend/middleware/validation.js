export class ValidationMiddleware {
    static validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    static validatePassword(password) {
        // Minimum 8 characters, at least one uppercase, one lowercase, one number
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
        return passwordRegex.test(password);
    }

    static sanitizeInput(input) {
        return input.replace(/[<>]/g, '');
    }

    static validateUserRegistration(req, res, next) {
        const { email, password, name } = req.body;

        const errors = [];

        if (!this.validateEmail(email)) {
            errors.push('Invalid email format');
        }

        if (!this.validatePassword(password)) {
            errors.push('Weak password');
        }

        if (!name || name.length < 2) {
            errors.push('Name must be at least 2 characters');
        }

        if (errors.length > 0) {
            return res.status(400).json({ errors });
        }

        req.body.email = this.sanitizeInput(email);
        req.body.name = this.sanitizeInput(name);

        next();
    }
}

export default ValidationMiddleware;