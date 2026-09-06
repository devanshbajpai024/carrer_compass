// dashboard.js

let appState = {
    profile: null,
    recommendations: []
};

document.addEventListener('DOMContentLoaded', async () => {
    window.components.renderSidebar('sidebar-container');
    window.components.renderHeader('header-container');
    window.components.renderSkeleton('recommendations-container', 'card', 3);
    await loadDashboardData();
});

async function loadDashboardData() {
    try {
        // Profile
        try {
            const profile = await window.api.getProfile();
            appState.profile = profile;
            renderHero(profile);
        } catch (err) {
            renderHeroError();
        }

        // Dashboard Summary — backend returns { profileCompletion, topRecommendations,
        // upcomingDeadlines, skillGaps, applicationSummary, recommendedProjects,
        // roadmapProgress, notifications }
        try {
            const summary = await window.api.getDashboardSummary();
            renderSummaryCards(summary);
        } catch (err) {
            renderSummaryError();
        }

        // Recommendations
        try {
            const recommendations = await window.api.getRecommendations();
            const items = Array.isArray(recommendations) ? recommendations : [];
            if (items.length > 0) {
                appState.recommendations = items;
                renderRecommendations(items);
                setupRecommendationClickHandlers();
            } else {
                window.components.renderEmptyState('recommendations-container', 'No recommendations yet',
                    'Complete your profile and add skills to get personalized matches.');
            }
        } catch (err) {
            window.components.renderErrorState('recommendations-container', 'Failed to load recommendations');
        }

        // Skills — backend returns { name, level } (NOT proficiency)
        try {
            const skills = await window.api.getSkills();
            const skillList = Array.isArray(skills) ? skills : [];
            if (skillList.length > 0) {
                renderSkillsProgress(skillList);
            } else {
                window.components.renderEmptyState('skills-container', 'No skills added yet',
                    'Go to the Skill Engine to add your skills.');
            }
        } catch (err) {
            window.components.renderErrorState('skills-container', 'Unable to load skills');
        }

        // Upcoming deadlines — use topRecommendations from dashboard summary
        try {
            const summary = await window.api.getDashboardSummary();
            renderUpcomingDeadlines(summary.upcomingDeadlines || []);
        } catch (err) {
            window.components.renderErrorState('upcoming-container', 'Unable to load upcoming deadlines');
        }

    } catch (globalError) {
        console.error('Dashboard initialization failed', globalError);
    }
}

function renderHero(profileData) {
    const container = document.getElementById('dashboard-hero-container');
    if (!profileData) return;

    // careerGoals is an array; education is an object
    const careerGoal = (profileData.careerGoals && profileData.careerGoals.length > 0)
        ? profileData.careerGoals[0]
        : 'No goal set';
    const education = profileData.education && profileData.education.degree
        ? `${profileData.education.degree} in ${profileData.education.branch || ''}`
        : 'Education not provided';

    container.innerHTML = `
        <div class="dashboard-hero">
            <div class="hero-info">
                <h1>Welcome back, <span id="hero-user-name">${profileData.name}</span></h1>
                <div class="hero-meta mt-2">
                    <span class="hero-meta-item">
                        <i><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg></i>
                        ${careerGoal}
                    </span>
                    <span class="hero-meta-item">
                        <i><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z"></path></svg></i>
                        ${education}
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
                <p style="color: var(--text-secondary);">Could not load your profile. Make sure the backend is running.</p>
            </div>
        </div>
    `;
}

function renderSummaryCards(summary) {
    const container = document.getElementById('summary-cards-container');
    if (!container) return;

    // Backend returns: { profileCompletion, topRecommendations[], applicationSummary{ saved, applied, ... } }
    const topRecs = Array.isArray(summary.topRecommendations) ? summary.topRecommendations : [];
    const appSummary = summary.applicationSummary || {};
    const profileCompletion = summary.profileCompletion || 0;

    container.innerHTML = `
        <div class="grid grid-cols-4 gap-4" style="margin-bottom: 2rem;">
            <div class="summary-card">
                <span class="summary-label">Profile Complete</span>
                <span class="summary-value">${profileCompletion}%</span>
            </div>
            <div class="summary-card">
                <span class="summary-label">Top Matches</span>
                <span class="summary-value">${topRecs.length}</span>
            </div>
            <div class="summary-card">
                <span class="summary-label">Applied</span>
                <span class="summary-value">${appSummary.applied || 0}</span>
            </div>
            <div class="summary-card">
                <span class="summary-label">Saved</span>
                <span class="summary-value">${appSummary.saved || 0}</span>
            </div>
        </div>
    `;
}

function renderSummaryError() {
    window.components.renderErrorState('summary-cards-container', 'Failed to load summary stats');
}

function renderRecommendations(items) {
    const container = document.getElementById('recommendations-container');

    let html = '<div class="grid grid-cols-3 gap-4">';
    items.forEach((item, index) => {
        // item is a Recommendation doc: { matchScore, opportunityId: { title, organization, ... } }
        const opp = item.opportunity || item.opportunityId || item;
        const title = opp.title || item.title || 'Untitled';
        const org = opp.organization || item.organization || '';
        const type = opp.type || item.type || 'Opportunity';
        const location = opp.location || item.location || '';
        const deadline = opp.deadline ? new Date(opp.deadline).toLocaleDateString() : '';
        const matchScore = item.matchScore || opp.matchScore || null;
        const skills = opp.skills ? opp.skills.map(s => s.skill || s) : [];
        const tagHTML = skills.map(skill => `<span class="badge badge-neutral">${skill}</span>`).join('');
        const oppId = (opp._id || item.opportunityId) ? String(opp._id || item.opportunityId) : '';

        html += `
            <div class="card recommendation-card" data-index="${index}" data-opp-id="${oppId}" style="cursor: pointer; position: relative;">
                <div class="rec-header">
                    <div>
                        <div style="font-size: 0.75rem; color: var(--accent); font-weight: 600; text-transform: uppercase; margin-bottom: 0.25rem;">${type}</div>
                        <h3 style="font-size: 1.125rem; margin-bottom: 0.25rem;">${title}</h3>
                        <div style="color: var(--text-secondary); font-size: 0.875rem;">${org}</div>
                    </div>
                    ${matchScore ? `<div class="match-score"><svg style="width: 14px; height: 14px;" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.381z" clip-rule="evenodd"></path></svg>${matchScore}%</div>` : ''}
                </div>

                <div class="rec-meta mt-2">
                    ${location ? `<span><svg style="width: 14px; height: 14px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>${location}</span>` : ''}
                    ${deadline ? `<span><svg style="width: 14px; height: 14px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>${deadline}</span>` : ''}
                </div>

                <div class="rec-tags mt-2">${tagHTML}</div>

                <div class="match-analysis-container" style="display: none; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border-color);">
                    <!-- Dynamic analysis inserted here -->
                </div>

                <div style="margin-top: auto; padding-top: 1rem; border-top: 1px solid var(--border-color); display: flex; gap: 0.5rem;">
                    <button class="btn btn-primary apply-btn" data-opp-id="${oppId}" style="flex: 1;">Apply</button>
                    <button class="btn btn-outline save-btn" data-opp-id="${oppId}">Save</button>
                </div>
            </div>
        `;
    });
    html += '</div>';
    container.innerHTML = html;
}

function setupRecommendationClickHandlers() {
    const container = document.getElementById('recommendations-container');

    // Apply / Save buttons
    container.addEventListener('click', async (e) => {
        const applyBtn = e.target.closest('.apply-btn');
        const saveBtn = e.target.closest('.save-btn');

        if (applyBtn) {
            const oppId = applyBtn.dataset.oppId;
            if (!oppId) return;
            applyBtn.disabled = true;
            applyBtn.textContent = 'Applying...';
            try {
                await window.api.applyToOpportunity(oppId);
                applyBtn.textContent = 'Applied ✓';
                applyBtn.classList.remove('btn-primary');
                applyBtn.classList.add('btn-outline');
                window.components.showToast('success', 'Application submitted!');
            } catch (err) {
                applyBtn.disabled = false;
                applyBtn.textContent = 'Apply';
                window.components.showToast('error', 'Failed to apply: ' + err.message);
            }
            return;
        }

        if (saveBtn) {
            const oppId = saveBtn.dataset.oppId;
            if (!oppId) return;
            saveBtn.disabled = true;
            saveBtn.textContent = 'Saving...';
            try {
                await window.api.saveOpportunity(oppId);
                saveBtn.textContent = 'Saved ✓';
                window.components.showToast('success', 'Opportunity saved!');
            } catch (err) {
                saveBtn.disabled = false;
                saveBtn.textContent = 'Save';
                window.components.showToast('error', 'Failed to save: ' + err.message);
            }
            return;
        }

        // Card click → show AI analysis
        const card = e.target.closest('.recommendation-card');
        if (!card || e.target.closest('button')) return;

        const analysisContainer = card.querySelector('.match-analysis-container');
        if (analysisContainer.style.display !== 'none') {
            analysisContainer.style.display = 'none';
            return;
        }

        const index = card.getAttribute('data-index');
        const recItem = appState.recommendations[index];
        const opp = recItem.opportunity || recItem.opportunityId || recItem;
        const student = appState.profile || {};

        analysisContainer.style.display = 'block';
        analysisContainer.innerHTML = `<div style="font-size: 0.875rem; color: var(--text-secondary); text-align: center;">Analyzing your match...</div>`;

        try {
            const payload = {
                student,
                opportunity: {
                    ...opp,
                    skills: opp.skills ? opp.skills.map(s => ({ skill: s.skill || s })) : []
                }
            };

            const data = await window.api.evaluateRecommendation(payload);

            let mlColor = 'var(--text-secondary)';
            if (data.mlPrediction >= 3) mlColor = 'var(--success)';
            else if (data.mlPrediction >= 1) mlColor = 'var(--accent)';
            else if (data.mlPrediction === 0) mlColor = 'var(--danger)';

            const missingSkillsHtml = (data.missingSkills && data.missingSkills.length > 0)
                ? `<div style="margin-top: 0.5rem; font-size: 0.75rem; font-weight: 600;">Missing Skills:</div>
                   <ul style="font-size: 0.75rem; color: var(--text-secondary); margin-left: 1rem; list-style: disc;">
                     ${data.missingSkills.map(s => `<li>${s}</li>`).join('')}
                   </ul>`
                : `<div style="margin-top: 0.5rem; font-size: 0.75rem; color: var(--success);">No major missing skills</div>`;

            analysisContainer.innerHTML = `
                <div style="font-size: 0.75rem; color: var(--text-secondary); font-weight: 600; text-transform: uppercase; margin-bottom: 0.5rem;">AI Match Analysis</div>
                <div style="display: flex; gap: 1rem; margin-bottom: 0.5rem;">
                    <div style="font-size: 0.875rem;"><strong>Rule Score:</strong> ${data.matchScore}%</div>
                    <div style="font-size: 0.875rem;"><strong>ML Prediction:</strong> <span style="color: ${mlColor}; font-weight: 600;">${data.mlLabel}</span></div>
                </div>
                <div style="font-size: 0.875rem; line-height: 1.4; color: var(--text-primary); margin-bottom: 0.5rem;">${data.explanation}</div>
                ${missingSkillsHtml}
            `;
        } catch (error) {
            analysisContainer.innerHTML = `<div style="font-size: 0.875rem; color: var(--danger); text-align: center;">Evaluation unavailable (${error.message})</div>`;
        }
    });
}

function renderSkillsProgress(skills) {
    const container = document.getElementById('skills-container');
    let html = '<div style="display: flex; flex-direction: column; gap: 1rem;">';
    skills.forEach(skill => {
        // Backend stores skill.level (0-100), NOT skill.proficiency
        const level = skill.level || 0;
        html += `
            <div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem; font-size: 0.875rem;">
                    <span>${skill.name}</span>
                    <span style="color: var(--accent);">${level}%</span>
                </div>
                <div style="width: 100%; height: 8px; background-color: var(--input-bg); border-radius: var(--border-radius-full); overflow: hidden;">
                    <div style="height: 100%; width: ${level}%; background-color: var(--accent); border-radius: var(--border-radius-full);"></div>
                </div>
            </div>
        `;
    });
    html += '</div>';
    container.innerHTML = html;
}

function renderUpcomingDeadlines(deadlines) {
    const container = document.getElementById('upcoming-container');
    if (!container) return;

    if (!deadlines || deadlines.length === 0) {
        window.components.renderEmptyState('upcoming-container', 'No upcoming deadlines',
            'Apply to opportunities to track their deadlines here.');
        return;
    }

    let html = '<div style="display: flex; flex-direction: column; gap: 0.75rem;">';
    deadlines.forEach(opp => {
        const deadline = opp.deadline ? new Date(opp.deadline).toLocaleDateString() : 'No deadline';
        const daysLeft = opp.deadline
            ? Math.ceil((new Date(opp.deadline) - new Date()) / (1000 * 60 * 60 * 24))
            : null;
        const urgencyColor = daysLeft !== null && daysLeft <= 3 ? 'var(--danger)' : 'var(--accent)';

        html += `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: var(--card-bg); border-radius: var(--border-radius-sm); border: 1px solid var(--border-color);">
                <div>
                    <div style="font-size: 0.875rem; font-weight: 500;">${opp.title}</div>
                    <div style="font-size: 0.75rem; color: var(--text-secondary);">${opp.organization || ''}</div>
                </div>
                <div style="text-align: right;">
                    <div style="font-size: 0.75rem; color: ${urgencyColor}; font-weight: 600;">${deadline}</div>
                    ${daysLeft !== null ? `<div style="font-size: 0.7rem; color: var(--text-secondary);">${daysLeft}d left</div>` : ''}
                </div>
            </div>
        `;
    });
    html += '</div>';
    container.innerHTML = html;
}
