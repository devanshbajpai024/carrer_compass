// internships.js

const internshipsModule = {
    init: () => {
        window.components.renderSidebar('sidebar-container');
        window.components.renderHeader('header-container');

        document.getElementById('apply-filters-btn').addEventListener('click', internshipsModule.loadData);

        internshipsModule.loadData();
    },

    loadData: async () => {
        const containerId = 'internships-container';
        window.components.renderSkeleton(containerId, 'card', 6);

        const type = document.getElementById('filter-type').value;
        const mode = document.getElementById('filter-mode').value;
        const sort = document.getElementById('filter-sort').value;

        try {
            const data = await window.api.getInternships({ type, mode, sort });
            
            if (data && data.length > 0) {
                internshipsModule.renderCards(data);
            } else {
                window.components.renderEmptyState(containerId, 'No opportunities found', 'Try adjusting your filters or checking back later.');
            }
        } catch (error) {
            console.error("Failed to fetch internships:", error);
            window.components.renderErrorState(containerId, 'Unable to load opportunities', internshipsModule.loadData);
        }
    },

    renderCards: (items) => {
        const container = document.getElementById('internships-container');
        
        let html = '<div class="grid grid-cols-3 gap-4">';
        
        items.forEach(item => {
            const skillsHTML = (item.skills || []).map(skill => `<span class="badge badge-neutral">${skill}</span>`).join('');
            
            html += `
                <div class="card opportunity-card">
                    <div class="opp-header">
                        <div>
                            <h3 class="opp-title">${item.title}</h3>
                            <div class="opp-org">${item.organization}</div>
                        </div>
                        ${item.matchScore ? `<span class="badge badge-success">${item.matchScore}% Match</span>` : ''}
                    </div>
                    
                    <div class="opp-meta-grid">
                        <div class="opp-meta-item">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                            ${item.location || 'Location Not Specified'}
                        </div>
                        <div class="opp-meta-item">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                            ${item.type || 'Opportunity'}
                        </div>
                        ${item.compensation ? `
                        <div class="opp-meta-item">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            ${item.compensation}
                        </div>
                        ` : ''}
                        ${item.deadline ? `
                        <div class="opp-meta-item">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            Ends: ${item.deadline}
                        </div>
                        ` : ''}
                    </div>
                    
                    <div class="opp-skills">
                        ${skillsHTML}
                    </div>
                    
                    <div class="opp-actions">
                        <button class="btn btn-primary" style="flex: 1;" onclick="window.components.showToast('info', 'Opening application...')">Apply</button>
                        <button class="btn btn-outline" onclick="window.components.showToast('success', 'Saved!')">Save</button>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        container.innerHTML = html;
    }
};

document.addEventListener('DOMContentLoaded', internshipsModule.init);
