// projects.js

const projectsModule = {
    init: () => {
        window.components.renderSidebar('sidebar-container');
        window.components.renderHeader('header-container');

        const filterDifficulty = document.getElementById('filter-difficulty');
        if (filterDifficulty) {
            filterDifficulty.addEventListener('change', projectsModule.loadData);
        }

        projectsModule.loadData();
    },

    loadData: async () => {
        const containerId = 'projects-container';
        window.components.renderSkeleton(containerId, 'card', 4);

        const difficulty = document.getElementById('filter-difficulty') ? document.getElementById('filter-difficulty').value : '';

        try {
            const data = await window.api.getProjects({ difficulty });
            
            if (data && data.length > 0) {
                projectsModule.renderCards(data);
            } else {
                window.components.renderEmptyState(containerId, 'No projects found', 'Update your profile and skills to get personalized project recommendations.');
            }
        } catch (error) {
            console.error("Failed to fetch projects:", error);
            window.components.renderErrorState(containerId, 'Unable to load recommendations', projectsModule.loadData);
        }
    },

    renderCards: (items) => {
        const container = document.getElementById('projects-container');
        
        let html = '<div class="grid grid-cols-2 gap-4">';
        
        items.forEach(item => {
            const techHTML = (item.technology || []).map(tech => `<span class="badge badge-neutral">${tech}</span>`).join('');
            const skillsHTML = (item.skillsDeveloped || []).map(skill => `<span class="badge badge-accent">${skill}</span>`).join('');
            
            // Generate difficulty dots
            let diffLevel = 1; // beginner
            if (item.difficulty === 'intermediate') diffLevel = 2;
            if (item.difficulty === 'advanced') diffLevel = 3;
            
            const diffDots = [1, 2, 3].map(level => 
                `<div class="diff-dot ${level <= diffLevel ? 'active' : ''}"></div>`
            ).join('');

            html += `
                <div class="card project-card">
                    <div class="project-header">
                        <h3 class="project-title">${item.title}</h3>
                        <div class="difficulty-indicator">
                            ${diffDots}
                            <span style="margin-left: 0.25rem; text-transform: capitalize;">${item.difficulty || 'Beginner'}</span>
                        </div>
                    </div>
                    
                    ${item.recommendationReason ? `
                    <div class="why-recommended">
                        <div class="why-recommended-icon">
                            <svg style="width: 16px; height: 16px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                            Why this project?
                        </div>
                        ${item.recommendationReason}
                    </div>
                    ` : ''}
                    
                    <div class="project-section-title">Technology Stack</div>
                    <div class="tech-stack">
                        ${techHTML || '<span class="text-muted">Not specified</span>'}
                    </div>

                    <div class="project-section-title">Skills Developed</div>
                    <div class="tech-stack" style="margin-bottom: 1rem;">
                        ${skillsHTML || '<span class="text-muted">Not specified</span>'}
                    </div>
                    
                    <div class="meta-info">
                        <div style="display: flex; align-items: center; gap: 0.25rem;">
                            <svg style="width: 16px; height: 16px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            Est. ${item.estimatedDuration || 'TBD'}
                        </div>
                    </div>
                    
                    <div style="margin-top: auto; display: flex; gap: 0.5rem; border-top: 1px solid var(--border-color); padding-top: 1rem;">
                        <button class="btn btn-primary" style="flex: 1;" onclick="window.components.showToast('info', 'Opening project details...')">View Details</button>
                        <button class="btn btn-outline" onclick="window.components.showToast('success', 'Project saved to portfolio backlog!')">Save</button>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        container.innerHTML = html;
    }
};

document.addEventListener('DOMContentLoaded', projectsModule.init);
