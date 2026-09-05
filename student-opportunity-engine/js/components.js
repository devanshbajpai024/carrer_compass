// components.css

const components = {
    renderSidebar: (containerId) => {
        const container = document.getElementById(containerId);
        if (!container) return;

        const path = window.location.pathname;
        const page = path.split('/').pop() || 'dashboard.html';

        const navItems = [
            { id: 'dashboard.html', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', label: 'Dashboard' },
            { id: 'skill-engine.html', icon: 'M13 10V3L4 14h7v7l9-11h-7z', label: 'Skill Engine' },
            { id: 'internships.html', icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', label: 'Internships & Jobs' },
            { id: 'hackathons.html', icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z', label: 'Hackathons & Quizzes' },
            { id: 'workshops.html', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253', label: 'Workshops' },
            { id: 'projects.html', icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4', label: 'Projects' },
            { id: 'career-roadmap.html', icon: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7', label: 'Career Roadmap' },
            { id: 'profile.html', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', label: 'Profile' }
        ];

        let navHTML = navItems.map(item => `
            <a href="${item.id}" class="nav-item ${page === item.id ? 'active' : ''}">
                <svg class="nav-icon" style="width: 20px; height: 20px;" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${item.icon}"></path></svg>
                <span class="nav-text">${item.label}</span>
            </a>
        `).join('');

        container.innerHTML = `
            <aside class="sidebar">
                <div class="sidebar-header">
                    <a href="dashboard.html" class="logo-container">
                        <svg class="logo-icon" style="width: 24px; height: 24px;" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                        <span class="logo-text">Opportunity Engine</span>
                    </a>
                </div>
                <nav class="sidebar-nav">
                    ${navHTML}
                </nav>
                <div class="sidebar-footer">
                    <button class="nav-item" style="width: 100%; border: none; background: transparent; text-align: left;" onclick="window.auth.logout()">
                        <svg style="width: 20px; height: 20px;" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                        <span class="nav-text">Logout</span>
                    </button>
                </div>
            </aside>
        `;
    },

    renderHeader: (containerId) => {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
            <header class="top-header">
                <div class="search-bar">
                    <svg style="width: 16px; height: 16px; color: var(--text-secondary);" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    <input type="text" class="search-input" placeholder="Search opportunities..." id="global-search-input">
                </div>
                <div class="header-actions">
                    <button class="icon-btn" title="Notifications">
                        <svg style="width: 20px; height: 20px;" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                    </button>
                    <a href="profile.html" class="icon-btn" title="Profile">
                        <svg style="width: 20px; height: 20px;" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </a>
                </div>
            </header>
        `;

        const searchInput = document.getElementById('global-search-input');
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    // Logic to handle global search
                    const query = e.target.value.trim();
                    if (query) {
                        window.components.showToast('info', `Searching for: ${query}`);
                        // In a real app, this might redirect to a search results page
                    }
                }
            });
        }
    },

    renderEmptyState: (containerId, message, subtext = '') => {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = `
            <div class="empty-state">
                <i class="icon">
                    <svg style="width: 48px; height: 48px; margin-bottom: 16px; color: var(--text-muted);" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
                </i>
                <h3 style="color: var(--text-primary); margin-bottom: 8px;">${message}</h3>
                <p style="color: var(--text-secondary); max-width: 400px; margin: 0 auto;">${subtext}</p>
            </div>
        `;
    },

    renderErrorState: (containerId, message, retryCallback = null) => {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = `
            <div class="error-state">
                <i class="icon">
                    <svg style="width: 48px; height: 48px; margin-bottom: 16px; color: var(--danger);" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                </i>
                <h3 style="color: var(--text-primary); margin-bottom: 8px;">${message}</h3>
                ${retryCallback ? `<button class="btn btn-outline mt-4" id="retry-btn-${containerId}">Try Again</button>` : ''}
            </div>
        `;

        if (retryCallback) {
            const btn = document.getElementById(`retry-btn-${containerId}`);
            if (btn) btn.addEventListener('click', retryCallback);
        }
    },

    renderSkeleton: (containerId, type = 'card', count = 3) => {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        let html = '';
        if (type === 'card') {
            html = '<div class="grid grid-cols-3 gap-4">';
            for(let i = 0; i < count; i++) {
                html += `
                <div class="card">
                    <div class="skeleton skeleton-title"></div>
                    <div class="skeleton skeleton-text"></div>
                    <div class="skeleton skeleton-text" style="width: 80%;"></div>
                    <div class="skeleton skeleton-text" style="width: 40%; margin-top: 1rem;"></div>
                </div>`;
            }
            html += '</div>';
        } else if (type === 'list') {
            html = '<div style="display: flex; flex-direction: column; gap: 1rem;">';
            for(let i = 0; i < count; i++) {
                html += `<div class="skeleton" style="height: 60px; width: 100%;"></div>`;
            }
            html += '</div>';
        }
        
        container.innerHTML = html;
    },

    showToast: (type = 'info', message) => {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        let icon = '';
        if (type === 'success') icon = '<svg style="width: 20px; height: 20px; color: var(--success);" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>';
        if (type === 'error') icon = '<svg style="width: 20px; height: 20px; color: var(--danger);" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>';
        if (type === 'info') icon = '<svg style="width: 20px; height: 20px; color: var(--accent);" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>';

        toast.innerHTML = `
            ${icon}
            <span style="color: var(--text-primary); font-size: 0.875rem;">${message}</span>
        `;

        container.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideIn 0.3s ease-out reverse forwards';
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }
};

window.components = components;
