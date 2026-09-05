// dashboard.js

document.addEventListener('DOMContentLoaded', async () => {
    // Inject common layout components
    window.components.renderSidebar('sidebar-container');
    window.components.renderHeader('header-container');

    // Initialize loading states for specific sections that don't have static skeleton HTML
    window.components.renderSkeleton('recommendations-container', 'card', 3);

    // Fetch and render dashboard data
    await loadDashboardData();
});

async function loadDashboardData() {
    try {
        // Attempt to fetch profile info for hero
        try {
            const profile = await window.api.getProfile();
            renderHero(profile);
        } catch (err) {
            renderHeroError();
        }

        // Fetch Dashboard Summary
        try {
            const summary = await window.api.getDashboardSummary();
            renderSummaryCards(summary);
        } catch (err) {
            renderSummaryError();
        }

        // Fetch Recommendations
        try {
            const recommendations = await window.api.getRecommendations();
            if (recommendations && recommendations.length > 0) {
                renderRecommendations(recommendations);
            } else {
                window.components.renderEmptyState('recommendations-container', 'No recommendations yet', 'Complete your profile and add more skills to get personalized matches.');
            }
        } catch (err) {
            window.components.renderErrorState('recommendations-container', 'Failed to load recommendations');
        }

        // Fetch Skills and Upcoming (Stubbed for now, waiting on specific API endpoints)
        try {
            const skills = await window.api.getSkills();
            if (skills && skills.length > 0) {
                renderSkillsProgress(skills);
            } else {
                window.components.renderEmptyState('skills-container', 'No skills added');
            }
        } catch (err) {
            window.components.renderErrorState('skills-container', 'Unable to load skills');
        }
        
        // Let's just mock the upcoming opportunities fetch error state directly
        window.components.renderErrorState('upcoming-container', 'Failed to load calendar');
        
    } catch (globalError) {
        console.error("Dashboard initialization failed", globalError);
    }
}

function renderHero(profileData) {
    const container = document.getElementById('dashboard-hero-container');
    if (!profileData) return;
    
    container.innerHTML = `
        <div class="dashboard-hero">
            <div class="hero-info">
                <h1>Welcome back, <span id="hero-user-name">${profileData.name}</span></h1>
                <div class="hero-meta mt-2">
                    <span class="hero-meta-item">
                        <i><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg></i>
                        ${profileData.careerGoal || 'No goal set'}
                    </span>
                    <span class="hero-meta-item">
                        <i><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z"></path></svg></i>
                        ${profileData.education || 'Education not provided'}
                    </span>
                </div>
            </div>
            <div>
                <a href="profile.html" class="btn btn-primary">Edit Profile</a>
            </div>
        </div>
    `;
}

function renderHeroError() {
    const container = document.getElementById('dashboard-hero-container');
    container.innerHTML = `
        <div class="dashboard-hero" style="border-color: var(--danger); background: var(--danger-light);">
            <div class="hero-info">
                <h1 style="color: var(--danger);">API Unavailable</h1>
                <p style="color: var(--text-secondary);">Could not load your profile data. Showing development state.</p>
            </div>
        </div>
    `;
}

function renderSummaryCards(summaryData) {
    const container = document.getElementById('summary-cards-container');
    if (!summaryData) return;

    container.innerHTML = `
        <div class="grid grid-cols-4 gap-4" style="margin-bottom: 2rem;">
            <div class="summary-card">
                <span class="summary-label">Recommended</span>
                <span class="summary-value">${summaryData.recommendedCount || 0}</span>
            </div>
            <div class="summary-card">
                <span class="summary-label">Average Match</span>
                <span class="summary-value">${summaryData.averageMatchScore || 0}%</span>
            </div>
            <div class="summary-card">
                <span class="summary-label">Applications</span>
                <span class="summary-value">${summaryData.applicationsCount || 0}</span>
            </div>
            <div class="summary-card">
                <span class="summary-label">Saved</span>
                <span class="summary-value">${summaryData.savedCount || 0}</span>
            </div>
        </div>
    `;
}

function renderSummaryError() {
    const container = document.getElementById('summary-cards-container');
    window.components.renderErrorState('summary-cards-container', 'Failed to load summary stats');
}

function renderRecommendations(items) {
    const container = document.getElementById('recommendations-container');
    
    let html = '<div class="grid grid-cols-3 gap-4">';
    items.forEach(item => {
        const tagHTML = (item.skills || []).map(skill => `<span class="badge badge-neutral">${skill}</span>`).join('');
        
        html += `
            <div class="card recommendation-card">
                <div class="rec-header">
                    <div>
                        <div style="font-size: 0.75rem; color: var(--accent); font-weight: 600; text-transform: uppercase; margin-bottom: 0.25rem;">${item.category || 'Opportunity'}</div>
                        <h3 style="font-size: 1.125rem; margin-bottom: 0.25rem;">${item.title}</h3>
                        <div style="color: var(--text-secondary); font-size: 0.875rem;">${item.organization}</div>
                    </div>
                    ${item.matchScore ? `<div class="match-score"><svg style="width: 14px; height: 14px;" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.381z" clip-rule="evenodd"></path></svg>${item.matchScore}%</div>` : ''}
                </div>
                
                <div class="rec-meta mt-2">
                    ${item.location ? `<span><svg style="width: 14px; height: 14px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>${item.location}</span>` : ''}
                    ${item.deadline ? `<span><svg style="width: 14px; height: 14px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>${item.deadline}</span>` : ''}
                </div>
                
                <div class="rec-tags mt-2">
                    ${tagHTML}
                </div>
                
                <div style="margin-top: auto; padding-top: 1rem; border-top: 1px solid var(--border-color); display: flex; gap: 0.5rem;">
                    <button class="btn btn-primary" style="flex: 1;">Apply</button>
                    <button class="btn btn-outline">Save</button>
                </div>
            </div>
        `;
    });
    html += '</div>';
    
    container.innerHTML = html;
}

function renderSkillsProgress(skills) {
    // Stub renderer
    const container = document.getElementById('skills-container');
    let html = '<div style="display: flex; flex-direction: column; gap: 1rem;">';
    skills.forEach(skill => {
        html += `
            <div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem; font-size: 0.875rem;">
                    <span>${skill.name}</span>
                    <span style="color: var(--accent);">${skill.proficiency}%</span>
                </div>
                <div style="width: 100%; height: 8px; background-color: var(--input-bg); border-radius: var(--border-radius-full); overflow: hidden;">
                    <div style="height: 100%; width: ${skill.proficiency}%; background-color: var(--accent); border-radius: var(--border-radius-full);"></div>
                </div>
            </div>
        `;
    });
    html += '</div>';
    container.innerHTML = html;
}
