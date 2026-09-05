// career-roadmap.js

const roadmapModule = {
    init: () => {
        window.components.renderSidebar('sidebar-container');
        window.components.renderHeader('header-container');
        roadmapModule.loadData();
    },

    loadData: async () => {
        const containerId = 'roadmap-container';
        
        // Custom skeleton for timeline
        const container = document.getElementById(containerId);
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
            const data = await window.api.getCareerRoadmap();
            
            if (data && data.stages && data.stages.length > 0) {
                roadmapModule.renderRoadmap(data.stages);
            } else {
                window.components.renderEmptyState(containerId, 'Roadmap not generated', 'Complete your profile and add career goals to generate your personalized roadmap.');
            }
        } catch (error) {
            console.error("Failed to fetch roadmap:", error);
            window.components.renderErrorState(containerId, 'Unable to load your career roadmap', roadmapModule.loadData);
        }
    },

    renderRoadmap: (stages) => {
        const container = document.getElementById('roadmap-container');
        
        let html = '<div class="roadmap-container">';
        
        stages.forEach(stage => {
            const isCompleted = stage.status === 'completed';
            const isCurrent = stage.status === 'current';
            const statusClass = isCompleted ? 'status-completed' : (isCurrent ? 'status-current' : 'status-upcoming');
            
            let iconSvg = '';
            if (isCompleted) {
                iconSvg = '<svg style="width: 20px; height: 20px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>';
            } else if (isCurrent) {
                iconSvg = '<svg style="width: 20px; height: 20px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>';
            } else {
                iconSvg = '<svg style="width: 20px; height: 20px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>';
            }

            const reqSkillsHTML = (stage.requiredSkills || []).map(skill => `<span class="badge badge-neutral">${skill}</span>`).join('');
            
            let actionsHTML = '';
            if (stage.recommendedActions && stage.recommendedActions.length > 0) {
                actionsHTML = '<div class="action-list">';
                stage.recommendedActions.forEach(action => {
                    actionsHTML += `
                        <div class="action-item ${isCurrent ? 'recommended' : ''}">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                            ${action}
                        </div>
                    `;
                });
                actionsHTML += '</div>';
            }

            html += `
                <div class="roadmap-stage ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}">
                    <div class="stage-icon">
                        ${iconSvg}
                    </div>
                    <div class="stage-card">
                        <div class="stage-title">
                            ${stage.title}
                            <span class="stage-status ${statusClass}">${stage.status}</span>
                        </div>
                        <div class="stage-desc">${stage.description}</div>
                        
                        ${reqSkillsHTML ? `
                        <div class="stage-section">
                            <div class="stage-section-title">Required Skills</div>
                            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                                ${reqSkillsHTML}
                            </div>
                        </div>
                        ` : ''}

                        ${actionsHTML ? `
                        <div class="stage-section" style="margin-top: 1.5rem;">
                            <div class="stage-section-title">Recommended Actions</div>
                            ${actionsHTML}
                        </div>
                        ` : ''}
                        
                        ${isCurrent ? `
                        <div style="margin-top: 1.5rem; border-top: 1px solid var(--border-color); padding-top: 1rem;">
                            <button class="btn btn-primary" onclick="window.components.showToast('info', 'Exploring stage opportunities...')">Explore Opportunities</button>
                        </div>
                        ` : ''}
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        container.innerHTML = html;
    }
};

document.addEventListener('DOMContentLoaded', roadmapModule.init);
