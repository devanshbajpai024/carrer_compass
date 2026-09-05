// workshops.js

const workshopsModule = {
    init: () => {
        window.components.renderSidebar('sidebar-container');
        window.components.renderHeader('header-container');

        document.getElementById('apply-filters-btn').addEventListener('click', workshopsModule.loadData);

        workshopsModule.loadData();
    },

    loadData: async () => {
        const containerId = 'workshops-container';
        window.components.renderSkeleton(containerId, 'card', 6);

        const category = document.getElementById('filter-category').value;
        const duration = document.getElementById('filter-duration').value;

        try {
            const data = await window.api.getWorkshops({ category, duration });
            
            if (data && data.length > 0) {
                workshopsModule.renderCards(data);
            } else {
                window.components.renderEmptyState(containerId, 'No programs found', 'Try adjusting your filters to see more results.');
            }
        } catch (error) {
            console.error("Failed to fetch workshops:", error);
            window.components.renderErrorState(containerId, 'Unable to load programs', workshopsModule.loadData);
        }
    },

    renderCards: (items) => {
        const container = document.getElementById('workshops-container');
        
        let html = '<div class="grid grid-cols-4 gap-4">';
        
        items.forEach(item => {
            const skillsHTML = (item.skills || []).map(skill => `<span class="badge badge-neutral">${skill}</span>`).join('');
            
            html += `
                <div class="card workshop-card">
                    ${item.category ? `<div class="category-badge">${item.category}</div>` : ''}
                    
                    <div class="ws-header">
                        <h3 class="ws-title">${item.title}</h3>
                        <div class="ws-org">${item.organizer}</div>
                    </div>
                    
                    <div class="ws-meta">
                        <div class="ws-meta-item">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                            ${item.date || 'Self-paced'}
                        </div>
                        <div class="ws-meta-item">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            ${item.duration || 'Flexible'}
                        </div>
                        <div class="ws-meta-item">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path></svg>
                            ${item.mode || 'Online'}
                        </div>
                    </div>
                    
                    <div style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 1rem; border-top: 1px dashed var(--border-color); padding-top: 0.5rem;">
                        <strong>Eligibility:</strong> ${item.eligibility || 'All students'}
                    </div>
                    
                    <div class="ws-skills">
                        ${skillsHTML}
                    </div>
                    
                    <div style="margin-top: auto; padding-top: 1rem;">
                        <button class="btn btn-outline w-full" onclick="window.components.showToast('info', 'Opening registration...')">Register Now</button>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        container.innerHTML = html;
    }
};

document.addEventListener('DOMContentLoaded', workshopsModule.init);
