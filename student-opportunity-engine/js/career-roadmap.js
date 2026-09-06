// career-roadmap.js

const roadmapModule = {
    init: () => {
        window.components.renderSidebar('sidebar-container');
        window.components.renderHeader('header-container');
        roadmapModule.loadData();
    },

    loadData: async () => {
        const containerId = 'roadmap-container';
        const container = document.getElementById(containerId);

        // Show skeleton while loading
        container.innerHTML = `
            <div class="roadmap-container">
                <div class="roadmap-stage">
                    <div class="stage-icon"></div>
                    <div class="skeleton" style="height: 150px; width: 100%; border-radius: var(--border-radius-md);"></div>
                </div>
                <div class="roadmap-stage">
                    <div class="stage-icon"></div>
                    <div class="skeleton" style="height: 150px; width: 100%; border-radius: var(--border-radius-md);"></div>
                </div>
            </div>
        `;

        try {
            // Backend returns array of CareerRoadmap docs: [{ targetCareer, nodes[], ... }]
            let roadmaps = await window.api.getCareerRoadmap();
            roadmaps = Array.isArray(roadmaps) ? roadmaps : [];

            if (roadmaps.length === 0) {
                // Try to auto-generate roadmap from the student's first career goal
                try {
                    const profile = await window.api.getProfile();
                    const goals = profile && profile.careerGoals;
                    if (goals && goals.length > 0) {
                        const generated = await window.api.generateRoadmap(goals[0]);
                        roadmaps = [generated];
                        window.components.showToast('success', `Roadmap generated for "${goals[0]}"!`);
                    }
                } catch (genErr) {
                    console.warn('Auto-generate roadmap failed:', genErr.message);
                }
            }

            if (roadmaps.length === 0) {
                window.components.renderEmptyState(containerId, 'Roadmap not generated',
                    'Set a career goal in your profile, then come back here to see your personalized roadmap.');
                return;
            }

            // Render all roadmaps (one per career goal)
            let allHtml = '';
            roadmaps.forEach(roadmap => {
                allHtml += `<h2 style="margin-bottom: 1.5rem; color: var(--accent);">🎯 ${roadmap.targetCareer}</h2>`;
                allHtml += '<div class="roadmap-container">';
                (roadmap.nodes || []).forEach(node => {
                    allHtml += roadmapModule.renderNode(node, roadmap.targetCareer);
                });
                allHtml += '</div>';
            });

            container.innerHTML = allHtml;
            roadmapModule.attachProgressHandlers();

        } catch (error) {
            console.error('Failed to fetch roadmap:', error);
            window.components.renderErrorState(containerId, 'Unable to load your career roadmap', roadmapModule.loadData);
        }
    },

    renderNode: (node, targetCareer) => {
        // node = { title, type, status, description }
        // status: 'completed' | 'in progress' | 'skill gap' | 'not started'
        const isCompleted = node.status === 'completed';
        const isInProgress = node.status === 'in progress';
        const isGap = node.status === 'skill gap';

        const statusClass = isCompleted ? 'status-completed' : (isInProgress ? 'status-current' : 'status-upcoming');

        let iconSvg = '';
        if (isCompleted) {
            iconSvg = '<svg style="width: 20px; height: 20px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>';
        } else if (isInProgress) {
            iconSvg = '<svg style="width: 20px; height: 20px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>';
        } else {
            iconSvg = '<svg style="width: 20px; height: 20px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>';
        }

        const gapWarning = isGap
            ? `<div style="margin-top: 0.75rem; font-size: 0.8rem; color: var(--danger); font-weight: 500;">⚠️ Skill gap — go to Skill Engine to learn this.</div>`
            : '';

        const markBtnLabel = isCompleted ? 'Mark Incomplete' : 'Mark as Complete';
        const markBtnStatus = isCompleted ? 'in progress' : 'completed';

        return `
            <div class="roadmap-stage ${isCompleted ? 'completed' : ''} ${isInProgress ? 'current' : ''}">
                <div class="stage-icon">${iconSvg}</div>
                <div class="stage-card">
                    <div class="stage-title">
                        ${node.title}
                        <span class="stage-status ${statusClass}">${node.status}</span>
                    </div>
                    <div class="stage-desc">${node.description || ''}</div>
                    ${gapWarning}
                    <div style="margin-top: 1rem; border-top: 1px solid var(--border-color); padding-top: 0.75rem;">
                        <button class="btn btn-outline progress-btn" style="font-size: 0.8rem;"
                            data-career="${targetCareer}"
                            data-title="${node.title}"
                            data-status="${markBtnStatus}">
                            ${markBtnLabel}
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    attachProgressHandlers: () => {
        document.querySelectorAll('.progress-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const targetCareer = btn.dataset.career;
                const nodeTitle = btn.dataset.title;
                const newStatus = btn.dataset.status;

                btn.disabled = true;
                btn.textContent = 'Saving...';
                try {
                    await window.api.updateRoadmapProgress(targetCareer, nodeTitle, newStatus);
                    window.components.showToast('success', 'Progress updated!');
                    await roadmapModule.loadData(); // Re-render
                } catch (err) {
                    window.components.showToast('error', 'Failed to update: ' + err.message);
                    btn.disabled = false;
                }
            });
        });
    }
};

document.addEventListener('DOMContentLoaded', roadmapModule.init);
