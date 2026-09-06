// api.js

const API_BASE_URL = 'http://localhost:3000/api';

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
            localStorage.removeItem('soe_token');
            window.location.href = 'index.html';
            throw new Error('Unauthorized. Please login again.');
        }

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.message || `API Error: ${response.status}`);
        }

        const json = await response.json();
        // Unwrap .data if present so callers get the payload directly
        return json.data !== undefined ? json.data : json;
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
    getMe: () => fetchWithAuth('/auth/me'),

    // Student profile
    getProfile: () => fetchWithAuth('/student/profile'),
    updateProfile: (data) => fetchWithAuth('/student/profile', { method: 'PUT', body: JSON.stringify(data) }),

    // Skills — backend replaces the whole array, no per-skill id route
    getSkills: () => fetchWithAuth('/student/skills'),
    updateSkills: (skills) => fetchWithAuth('/student/skills', { method: 'PUT', body: JSON.stringify({ skills }) }),
    // Convenience alias: add a skill by fetching current list first and appending
    addSkill: async (skill) => {
        const current = await fetchWithAuth('/student/skills');
        const updated = [...(current || []), { name: skill.name, level: Number(skill.proficiency || skill.level || 0) }];
        return fetchWithAuth('/student/skills', { method: 'PUT', body: JSON.stringify({ skills: updated }) });
    },
    updateSkill: async (name, data) => {
        const current = await fetchWithAuth('/student/skills');
        const updated = (current || []).map(s =>
            s.name === name ? { ...s, level: Number(data.proficiency || data.level || s.level) } : s
        );
        return fetchWithAuth('/student/skills', { method: 'PUT', body: JSON.stringify({ skills: updated }) });
    },

    // Interests & Goals
    getInterests: () => fetchWithAuth('/student/interests'),
    updateInterests: (interests) => fetchWithAuth('/student/interests', { method: 'PUT', body: JSON.stringify({ interests }) }),
    getGoals: () => fetchWithAuth('/student/goals'),
    updateGoals: (careerGoals) => fetchWithAuth('/student/goals', { method: 'PUT', body: JSON.stringify({ careerGoals }) }),

    // Dashboard
    getDashboardSummary: () => fetchWithAuth('/dashboard'),

    // Recommendations
    getRecommendations: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return fetchWithAuth(`/recommendations?${query}`);
    },
    refreshRecommendations: () => fetchWithAuth('/recommendations/refresh', { method: 'POST' }),

    // Discovery Modules
    getInternships: (params = {}) => {
        const query = new URLSearchParams({ type: 'INTERNSHIP', ...params }).toString();
        return fetchWithAuth(`/opportunities?${query}`);
    },
    getHackathons: (params = {}) => {
        const query = new URLSearchParams({ type: 'HACKATHON', ...params }).toString();
        return fetchWithAuth(`/opportunities?${query}`);
    },
    getWorkshops: (params = {}) => {
        const query = new URLSearchParams({ type: 'WORKSHOP', ...params }).toString();
        return fetchWithAuth(`/opportunities?${query}`);
    },
    getProjects: (params = {}) => {
        const query = new URLSearchParams({ type: 'PROJECT', ...params }).toString();
        return fetchWithAuth(`/opportunities?${query}`);
    },
    getOpportunityById: (id) => fetchWithAuth(`/opportunities/${id}`),

    // Applications — Apply & Save
    getApplications: () => fetchWithAuth('/applications'),
    applyToOpportunity: (opportunityId, notes = '') =>
        fetchWithAuth('/applications', {
            method: 'POST',
            body: JSON.stringify({ opportunityId, status: 'APPLIED', notes })
        }),
    saveOpportunity: (opportunityId) =>
        fetchWithAuth('/applications', {
            method: 'POST',
            body: JSON.stringify({ opportunityId, status: 'SAVED' })
        }),
    updateApplication: (id, data) =>
        fetchWithAuth(`/applications/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteApplication: (id) =>
        fetchWithAuth(`/applications/${id}`, { method: 'DELETE' }),

    // Career Roadmap
    getCareerRoadmap: () => fetchWithAuth('/roadmap'),
    generateRoadmap: (targetCareer) =>
        fetchWithAuth('/roadmap/generate', { method: 'POST', body: JSON.stringify({ targetCareer }) }),
    updateRoadmapProgress: (targetCareer, nodeTitle, status) =>
        fetchWithAuth('/roadmap/progress', { method: 'PUT', body: JSON.stringify({ targetCareer, nodeTitle, status }) }),

    // Notifications
    getNotifications: () => fetchWithAuth('/notifications'),
    markNotificationRead: (id) => fetchWithAuth(`/notifications/${id}/read`, { method: 'PUT' }),
    markAllNotificationsRead: () => fetchWithAuth('/notifications/read-all', { method: 'PUT' }),

    // Skill Analysis
    getSkillAnalysis: () => fetchWithAuth('/skills/student/skill-analysis'),
    getSkillGaps: () => fetchWithAuth('/skills/student/skill-gaps'),
    getAllKnownSkills: () => fetchWithAuth('/skills'),

    // AI Chat
    chatWithAI: (message) => fetchWithAuth('/ai/chat', { method: 'POST', body: JSON.stringify({ message }) }),

    // Global Search
    globalSearch: (query) => fetchWithAuth(`/search?q=${encodeURIComponent(query)}`),

    // ML + AI Evaluation
    evaluateRecommendation: (data) =>
        fetchWithAuth('/recommendations/evaluate', { method: 'POST', body: JSON.stringify(data) })
};

window.api = api;
