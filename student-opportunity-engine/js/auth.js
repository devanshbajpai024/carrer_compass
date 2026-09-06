// auth.js

const auth = {
    isAuthenticated: () => {
        return !!localStorage.getItem('soe_token');
    },

    login: async (email, password) => {
        try {
            // api.js auto-unwraps .data, so response = { _id, name, email, token }
            const response = await window.api.login({ email, password });
            const token = response && (response.token || (response.data && response.data.token));
            if (token) {
                localStorage.setItem('soe_token', token);
                window.location.href = 'dashboard.html';
            } else {
                throw new Error('No token received from server');
            }
        } catch (error) {
            console.error('Authentication failed:', error);
            throw error;
        }
    },

    register: async (name, email, password) => {
        try {
            const response = await window.api.register({ name, email, password });
            const token = response && (response.token || (response.data && response.data.token));
            if (token) {
                localStorage.setItem('soe_token', token);
                window.location.href = 'dashboard.html';
            } else {
                throw new Error('No token received from server after registration');
            }
        } catch (error) {
            console.error('Registration failed:', error);
            throw error;
        }
    },

    logout: () => {
        localStorage.removeItem('soe_token');
        window.location.href = 'index.html';
    },

    checkAuth: () => {
        // Only redirect from protected pages if strictly enforcing auth.
        // For development viewing, we will just warn if token is missing.
        const isPublicPage = window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('student-opportunity-engine/');
        
        if (!auth.isAuthenticated() && !isPublicPage) {
            console.warn('[DEV] No auth token found. API requests will likely fail. Please connect a backend.');
            // window.location.href = 'index.html'; // Disabled for UI development review purposes.
        } else if (auth.isAuthenticated() && isPublicPage) {
            window.location.href = 'dashboard.html';
        }
    }
};

window.auth = auth;

// Run check on script load
document.addEventListener('DOMContentLoaded', auth.checkAuth);
