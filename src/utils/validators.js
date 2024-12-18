export const Validators = {
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    validatePassword(password) {
        // At least 8 characters, one uppercase, one lowercase, one number
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
        return passwordRegex.test(password);
    },

    validateName(name) {
        return name.length >= 2 && name.length <= 50;
    },

    sanitizeInput(input) {
        // Basic HTML escape to prevent XSS
        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML;
    },

    validatePhoneNumber(phone) {
        const phoneRegex = /^(\+\d{1,3}[- ]?)?\d{10}$/;
        return phoneRegex.test(phone);
    }
};

export const ErrorMessages = {
    EMAIL_INVALID: "Please enter a valid email address.",
    PASSWORD_WEAK: "Password must be at least 8 characters with uppercase, lowercase, and number.",
    NAME_INVALID: "Name must be between 2 and 50 characters.",
    PHONE_INVALID: "Please enter a valid phone number."
};