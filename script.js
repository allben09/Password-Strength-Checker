class PasswordStrengthChecker {
    constructor() {
        // DOM Elements
        this.passwordInput = document.getElementById('passwordInput');
        this.strengthBar = document.getElementById('strengthBar');
        this.strengthLabel = document.getElementById('strengthLabel');
        this.toggleBtn = document.getElementById('toggleVisibility');
        this.generateBtn = document.getElementById('generatePassword');
        this.copyBtn = document.getElementById('copyPassword');
        this.breachBtn = document.getElementById('checkBreach');
        this.feedback = document.getElementById('feedback');
        this.generatedDisplay = document.getElementById('generatedDisplay');
        this.generatedPassword = document.getElementById('generatedPassword');
        this.themeToggle = document.getElementById('themeToggle');

        // Common passwords (top 100)
        this.commonPasswords = new Set([
            '123456', 'password', '12345678', 'qwerty', '123456789',
            '12345', '1234', '111111', '1234567', 'dragon',
            '123123', 'baseball', 'abc123', 'football', 'monkey',
            'letmein', 'shadow', 'master', '666666', 'qwertyuiop',
            '123321', 'mustang', '1234567890', 'michael', '654321',
            'superman', '1qaz2wsx', '7777777', '121212', '000000'
        ]);

        this.initialize();
    }

    initialize() {
        this.initializeEventListeners();
        this.loadTheme();
    }

    initializeEventListeners() {
        // Password input - real-time analysis
        this.passwordInput.addEventListener('input', () => this.checkStrength());

        // Toggle visibility
        this.toggleBtn.addEventListener('click', () => this.toggleVisibility());

        // Generate password
        this.generateBtn.addEventListener('click', () => this.generateStrongPassword());

        // Copy password
        this.copyBtn.addEventListener('click', () => this.copyPassword());

        // Check breach
        this.breachBtn.addEventListener('click', () => this.checkBreach());

        // Theme toggle
        this.themeToggle.addEventListener('click', () => this.toggleTheme());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'g') {
                e.preventDefault();
                this.generateStrongPassword();
            }
        });
    }

    // ==================== PASSWORD STRENGTH CHECK ====================
    checkStrength() {
        const password = this.passwordInput.value;

        if (!password) {
            this.resetUI();
            return;
        }

        const results = this.analyzePassword(password);
        this.updateUI(results);
        this.updateAnalysisItems(results);
        this.showDetailedFeedback(results);
    }

    analyzePassword(password) {
        const length = password.length;
        const hasUppercase = /[A-Z]/.test(password);
        const hasLowercase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        const hasRepeating = /(.)\1{2,}/.test(password);
        const hasSequence = this.hasSequentialPattern(password);
        const isCommon = this.commonPasswords.has(password.toLowerCase());

        // Calculate score (0-100)
        let score = 0;

        // Length scoring
        if (length >= 8) score += 20;
        if (length >= 12) score += 15;
        if (length >= 16) score += 10;

        // Character variety
        if (hasUppercase) score += 12;
        if (hasLowercase) score += 8;
        if (hasNumbers) score += 12;
        if (hasSpecial) score += 18;

        // Deductions
        if (hasRepeating) score -= 15;
        if (hasSequence) score -= 10;
        if (isCommon) score -= 30;
        if (length < 8) score -= 20;

        // Clamp
        score = Math.max(0, Math.min(100, score));

        // Determine strength
        let strength = 'weak';
        let color = '#ff5555';
        if (score >= 80) {
            strength = 'strong';
            color = '#00ff96';
        } else if (score >= 60) {
            strength = 'good';
            color = '#ffd93d';
        } else if (score >= 40) {
            strength = 'fair';
            color = '#ff9f43';
        }

        return {
            score,
            strength,
            color,
            length,
            hasUppercase,
            hasLowercase,
            hasNumbers,
            hasSpecial,
            hasRepeating,
            hasSequence,
            isCommon,
            checks: {
                length: length >= 8,
                uppercase: hasUppercase,
                lowercase: hasLowercase,
                numbers: hasNumbers,
                special: hasSpecial,
                repeating: !hasRepeating,
                sequence: !hasSequence,
                common: !isCommon
            }
        };
    }

    hasSequentialPattern(password) {
        const sequences = [
            'abcdefghijklmnopqrstuvwxyz',
            'zyxwvutsrqponmlkjihgfedcba',
            '0123456789',
            '9876543210',
            'qwertyuiop',
            'poiuytrewq',
            'asdfghjkl',
            'lkjhgfdsa',
            'zxcvbnm',
            'mnbvcxz'
        ];

        const lower = password.toLowerCase();
        for (const seq of sequences) {
            for (let i = 0; i < seq.length - 3; i++) {
                if (lower.includes(seq.slice(i, i + 4))) {
                    return true;
                }
            }
        }
        return false;
    }

    // ==================== UI UPDATES ====================
    updateUI(results) {
        // Update strength bar
        this.strengthBar.style.width = `${results.score}%`;
        this.strengthBar.style.background = `linear-gradient(90deg, ${results.color}, ${results.color}dd)`;

        // Update label
        const emojis = {
            weak: '🔴',
            fair: '🟡',
            good: '🟢',
            strong: '🟣'
        };
        const label = `${emojis[results.strength]} ${results.strength.toUpperCase()} (${results.score}/100)`;
        this.strengthLabel.textContent = label;
        this.strengthLabel.style.color = results.color;
    }

    updateAnalysisItems(results) {
        const checkMap = {
            lengthCheck: 'length',
            uppercaseCheck: 'uppercase',
            lowercaseCheck: 'lowercase',
            numberCheck: 'numbers',
            specialCheck: 'special',
            repeatCheck: 'repeating',
            sequenceCheck: 'sequence',
            commonCheck: 'common'
        };

        Object.entries(checkMap).forEach(([elementId, key]) => {
            const element = document.getElementById(elementId);
            const isValid = results.checks[key];
            const parent = element.closest('.analysis-item');

            parent.classList.remove('valid', 'invalid');
            parent.classList.add(isValid ? 'valid' : 'invalid');
            element.textContent = isValid ? '✅' : '❌';
        });
    }

    showDetailedFeedback(results) {
        const feedbacks = [];

        if (results.length < 8) {
            feedbacks.push('⚠️ Password is too short (minimum 8 characters)');
        }
        if (!results.hasUppercase) {
            feedbacks.push('⚠️ Add uppercase letters for better security');
        }
        if (!results.hasLowercase) {
            feedbacks.push('⚠️ Add lowercase letters');
        }
        if (!results.hasNumbers) {
            feedbacks.push('⚠️ Include numbers to increase strength');
        }
        if (!results.hasSpecial) {
            feedbacks.push('⚠️ Add special characters (!@#$%^&*)');
        }
        if (results.hasRepeating) {
            feedbacks.push('⚠️ Avoid repeated characters (e.g., "aaa")');
        }
        if (results.hasSequence) {
            feedbacks.push('⚠️ Avoid sequential patterns (e.g., "1234", "abcd")');
        }
        if (results.isCommon) {
            feedbacks.push('⚠️ This is a commonly used password!');
        }

        if (results.score >= 80) {
            feedbacks.unshift('✅ Excellent password! Very strong security.');
        } else if (results.score >= 60) {
            feedbacks.unshift('👍 Good password, but could be stronger.');
        } else if (results.score >= 40) {
            feedbacks.unshift('🔧 Fair password. Consider improving it.');
        } else {
            feedbacks.unshift('❌ Weak password! Please improve it.');
        }

        this.showFeedback(feedbacks.join('<br>'),
            results.score >= 80 ? 'success' :
            results.score >= 60 ? 'info' :
            results.score >= 40 ? 'warning' : 'danger'
        );
    }

    showFeedback(message, type = 'info') {
        this.feedback.innerHTML = message;
        this.feedback.className = `feedback visible ${type}`;
    }

    resetUI() {
        this.strengthBar.style.width = '0%';
        this.strengthLabel.textContent = 'Enter a password to check';
        this.strengthLabel.style.color = 'var(--text-secondary)';
        this.feedback.className = 'feedback';
        this.feedback.innerHTML = '';

        document.querySelectorAll('.analysis-item').forEach(item => {
            item.classList.remove('valid', 'invalid');
        });
        document.querySelectorAll('.check-status').forEach(el => {
            el.textContent = '❌';
        });
    }

    // ==================== PASSWORD GENERATOR ====================
    generateStrongPassword() {
        const length = 16;
        const charset = {
            uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
            lowercase: 'abcdefghijklmnopqrstuvwxyz',
            numbers: '0123456789',
            special: '!@#$%^&*()_+-=[]{}|;:,.<>?'
        };

        // Ensure at least one of each type
        const password = [
            this.getRandomChar(charset.uppercase),
            this.getRandomChar(charset.lowercase),
            this.getRandomChar(charset.numbers),
            this.getRandomChar(charset.special)
        ];

        // Fill the rest
        const allChars = Object.values(charset).join('');
        while (password.length < length) {
            password.push(this.getRandomChar(allChars));
        }

        // Shuffle
        const shuffled = password.sort(() => Math.random() - 0.5);
        const finalPassword = shuffled.join('');

        // Display
        this.generatedPassword.textContent = finalPassword;
        this.generatedDisplay.classList.add('visible');
        this.copyBtn.disabled = false;
        this.breachBtn.disabled = false;

        // Auto-check strength
        this.passwordInput.value = finalPassword;
        this.checkStrength();

        this.showFeedback('✨ Strong password generated! Copy it to use.', 'success');
    }

    getRandomChar(chars) {
        return chars[Math.floor(Math.random() * chars.length)];
    }

    // ==================== COPY PASSWORD ====================
    copyPassword() {
        const text = this.generatedPassword.textContent;
        if (text) {
            navigator.clipboard.writeText(text);
            this.showFeedback('📋 Password copied to clipboard!', 'success');
        }
    }

    // ==================== BREACH DETECTION ====================
    async checkBreach() {
        const password = this.generatedPassword.textContent || this.passwordInput.value;
        if (!password) return;

        this.showFeedback('🔍 Checking if password has been breached...', 'info');
        this.breachBtn.disabled = true;

        try {
            const hash = await this.sha1(password);
            const prefix = hash.slice(0, 5);
            const suffix = hash.slice(5).toUpperCase();

            const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
            const data = await response.text();

            const lines = data.split('\n');
            let isBreached = false;

            for (const line of lines) {
                if (line.startsWith(suffix)) {
                    isBreached = true;
                    const count = line.split(':')[1];
                    this.showFeedback(
                        `⚠️ This password has been breached ${count} times! Choose a different one.`,
                        'danger'
                    );
                    break;
                }
            }

            if (!isBreached) {
                this.showFeedback('✅ Great! This password has not been found in any known breaches.', 'success');
            }
        } catch (error) {
            this.showFeedback('❌ Error checking breach. Please try again later.', 'danger');
        } finally {
            this.breachBtn.disabled = false;
        }
    }

    async sha1(message) {
        const msgBuffer = new TextEncoder().encode(message);
        const hashBuffer = await crypto.subtle.digest('SHA-1', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    // ==================== TOGGLE VISIBILITY ====================
    toggleVisibility() {
        const type = this.passwordInput.type === 'password' ? 'text' : 'password';
        this.passwordInput.type = type;
        this.toggleBtn.querySelector('i').className =
            type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
    }

    // ==================== THEME ====================
    toggleTheme() {
        const html = document.documentElement;
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        this.updateThemeIcon(newTheme);
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
        this.updateThemeIcon(savedTheme);
    }

    updateThemeIcon(theme) {
        const icon = this.themeToggle.querySelector('i');
        icon.className = theme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    new PasswordStrengthChecker();
});
