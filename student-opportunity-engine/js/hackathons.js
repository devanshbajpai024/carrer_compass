// hackathons.js

const hackathonsModule = {
    currentCategory: 'hackathons',

    init: () => {
        window.components.renderSidebar('sidebar-container');
        window.components.renderHeader('header-container');

        // Setup tabs
        const tabs = document.querySelectorAll('.tab-item');
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                tabs.forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
                hackathonsModule.currentCategory = e.target.dataset.category;
                hackathonsModule.loadData();
            });
        });

        document.getElementById('apply-filters-btn').addEventListener('click', hackathonsModule.loadData);

        hackathonsModule.loadData();
    },

    loadData: async () => {
        const containerId = 'events-container';
        window.components.renderSkeleton(containerId, 'card', 6);

        const searchQuery = document.getElementById('search-input').value;
        const mode = document.getElementById('filter-mode').value;

        try {
            const data = await window.api.getHackathons({ category: hackathonsModule.currentCategory, q: searchQuery, mode });
            
            if (data && data.length > 0) {
                hackathonsModule.renderCards(data);
            } else {
                window.components.renderEmptyState(containerId, 'No events found', `Try adjusting your filters to find more ${hackathonsModule.currentCategory}.`);
            }
        } catch (error) {
            console.error(`Failed to fetch ${hackathonsModule.currentCategory}:`, error);
            window.components.renderErrorState(containerId, 'Unable to load events', hackathonsModule.loadData);
        }
    },

    renderCards: (items) => {
        const container = document.getElementById('events-container');
        
        let html = '<div class="grid grid-cols-3 gap-4">';
        
        items.forEach(item => {
            const skillsHTML = (item.skills || []).map(skill => `<span class="badge badge-neutral">${skill}</span>`).join('');
            
            html += `
                <div class="card event-card">
                    <div class="event-header">
                        <div>
                            <h3 class="event-title">${item.title}</h3>
                            <div class="event-org">${item.organizer}</div>
                        </div>
                        ${item.matchScore ? `<span class="badge badge-success">${item.matchScore}% Match</span>` : ''}
                    </div>
                    
                    <div class="event-meta-grid">
                        <div class="event-meta-item">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                            ${item.date || 'Date TBD'}
                        </div>
                        <div class="event-meta-item">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path></svg>
                            ${item.mode || 'Online'}
                        </div>
                        ${item.prize ? `
                        <div class="event-meta-item">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            Prize: ${item.prize}
                        </div>
                        ` : ''}
                        ${item.deadline ? `
                        <div class="event-meta-item">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            Reg ends: ${item.deadline}
                        </div>
                        ` : ''}
                    </div>
                    
                    <div style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 1rem;">
                        <strong>Eligibility:</strong> ${item.eligibility || 'Open to all'}
                    </div>
                    
                    <div class="event-skills">
                        ${skillsHTML}
                    </div>
                    
                    <div style="margin-top: auto; display: flex; gap: 0.5rem; border-top: 1px solid var(--border-color); padding-top: 1rem;">
                        <button class="btn btn-primary" style="flex: 1;" onclick="window.components.showToast('info', 'Redirecting to registration...')">Register</button>
                        <button class="btn btn-outline" onclick="window.components.showToast('success', 'Saved event!')">Save</button>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        container.innerHTML = html;
    }
};

document.addEventListener('DOMContentLoaded', hackathonsModule.init);
