// api.js

const API_BASE_URL = 'https://api.student-opportunity-engine.com/v1';

/**
 * Core fetch wrapper with authentication and error handling
 */
async function fetchWithAuth(endpoint, options = {}) {
    const token = localStorage.getItem('soe_token');
    
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers
        });

        if (response.status === 401) {
            // Unauthorized
            localStorage.removeItem('soe_token');
            window.location.href = 'index.html';
            throw new Error('Unauthorized. Please login again.');
        }

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`[API Error] ${endpoint}:`, error);
        throw error;
    }
}

// API Service Object
const api = {
    // Auth
    login: (credentials) => fetchWithAuth('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
    register: (userData) => fetchWithAuth('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
    getProfile: () => fetchWithAuth('/profile'),
    updateProfile: (data) => fetchWithAuth('/profile', { method: 'PUT', body: JSON.stringify(data) }),
    
    // Dashboard
    getDashboardSummary: () => fetchWithAuth('/dashboard/summary'),
    getRecommendations: () => fetchWithAuth('/dashboard/recommendations'),
    
    // Skills
    getSkills: () => fetchWithAuth('/skills'),
    updateSkill: (skillId, data) => fetchWithAuth(`/skills/${skillId}`, { method: 'PUT', body: JSON.stringify(data) }),
    addSkill: (data) => fetchWithAuth('/skills', { method: 'POST', body: JSON.stringify(data) }),
    
    // Discovery Modules
    getInternships: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return fetchWithAuth(`/opportunities/internships?${query}`);
    },
    getHackathons: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return fetchWithAuth(`/opportunities/hackathons?${query}`);
    },
    getWorkshops: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return fetchWithAuth(`/opportunities/workshops?${query}`);
    },
    getProjects: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return fetchWithAuth(`/opportunities/projects?${query}`);
    },
    
    // Career Roadmap
    getCareerRoadmap: () => fetchWithAuth('/career-roadmap'),
    
    // Global Search
    globalSearch: (query) => fetchWithAuth(`/search?q=${encodeURIComponent(query)}`)
};

window.api = api;
