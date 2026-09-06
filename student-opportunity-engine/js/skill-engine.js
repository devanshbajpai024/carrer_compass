// skill-engine.js

const skillEngine = {
    init: async () => {
        window.components.renderSidebar('sidebar-container');
        window.components.renderHeader('header-container');

        document.getElementById('skill-form').addEventListener('submit', skillEngine.handleFormSubmit);

        await skillEngine.loadData();
    },

    loadData: async () => {
        try {
            // GET /student/skills returns [{ name, level }]
            const skills = await window.api.getSkills();
            const skillList = Array.isArray(skills) ? skills : [];

            if (skillList.length > 0) {
                skillEngine.renderCurrentSkills(skillList);
            } else {
                window.components.renderEmptyState('current-skills-container', 'No skills added yet',
                    'Start by adding your first skill using the form below.');
            }

            // GET /skills/student/skill-analysis returns [{ career, skills: [{ name, current, required, status }] }]
            try {
                const analysis = await window.api.getSkillAnalysis();
                const analysisList = Array.isArray(analysis) ? analysis : [];

                // Collect all GAP skills across career goals
                const gaps = [];
                let alignmentScore = 0;
                let alignmentGoal = '';
                analysisList.forEach(entry => {
                    const ready = entry.skills.filter(s => s.status === 'READY').length;
                    const total = entry.skills.length;
                    if (total > 0 && (!alignmentGoal || ready / total > alignmentScore / 100)) {
                        alignmentScore = Math.round((ready / total) * 100);
                        alignmentGoal = entry.career;
                    }
                    entry.skills.filter(s => s.status === 'GAP').forEach(s => gaps.push(s));
                });

                if (gaps.length > 0) {
                    skillEngine.renderGaps(gaps);
                } else {
                    window.components.renderEmptyState('skill-gaps-container', 'No skill gaps detected',
                        'Either your skills match your goals or no career goals are set.');
                }

                if (alignmentGoal) {
                    skillEngine.renderAlignment({ score: alignmentScore, goal: alignmentGoal });
                } else {
                    window.components.renderEmptyState('career-alignment-container', 'No career goals set',
                        'Add career goals in your profile to see alignment.');
                }
            } catch (analysisErr) {
                console.warn('Skill analysis unavailable:', analysisErr.message);
                window.components.renderEmptyState('skill-gaps-container', 'Could not load skill gaps');
                window.components.renderEmptyState('career-alignment-container', 'Could not load alignment');
            }

            window.components.renderEmptyState('recommended-skills-container', 'Coming soon',
                'Skill recommendations will appear here once career goals are analysed.');
            window.components.renderEmptyState('opportunity-compat-container', 'Coming soon',
                'Opportunity compatibility scoring is being calculated.');

        } catch (error) {
            console.error('Failed to load skill engine data:', error);
            window.components.renderErrorState('current-skills-container', 'Failed to load skills');
            window.components.renderErrorState('skill-gaps-container', 'Failed to load analysis');
            window.components.renderErrorState('career-alignment-container', 'Failed to load alignment');
            window.components.renderErrorState('recommended-skills-container', 'Failed to load recommendations');
            window.components.renderErrorState('opportunity-compat-container', 'Failed to load compatibility');
        }
    },

    renderCurrentSkills: (skills) => {
        const container = document.getElementById('current-skills-container');
        let html = '';

        skills.forEach(skill => {
            // Model stores { name, level } — NOT proficiency
            const level = skill.level || 0;
            html += `
                <div class="skill-item">
                    <div class="skill-header">
                        <span style="font-weight: 500;">${skill.name}</span>
                        <div class="skill-actions">
                            <span style="color: var(--accent); font-weight: 600;">${level}%</span>
                        </div>
                    </div>
                    <div class="skill-progress-bar">
                        <div class="skill-progress-fill" style="width: ${level}%;"></div>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
    },

    renderGaps: (gaps) => {
        const container = document.getElementById('skill-gaps-container');
        let html = '<div style="display: flex; flex-direction: column; gap: 0.5rem;">';

        gaps.forEach(gap => {
            // gap = { name, current, required, status }
            html += `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background-color: var(--card-bg); border-radius: var(--border-radius-sm); border: 1px solid var(--border-color);">
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <svg style="width: 16px; height: 16px; color: var(--danger);" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                        <span>${gap.name}</span>
                        <span style="font-size: 0.75rem; color: var(--text-secondary);">Current: ${gap.current}%</span>
                    </div>
                    <span class="badge badge-danger">Need: ${gap.required}%</span>
                </div>
            `;
        });

        html += '</div>';
        container.innerHTML = html;
    },

    renderAlignment: (alignment) => {
        const container = document.getElementById('career-alignment-container');
        container.innerHTML = `
            <div style="text-align: center; padding: 1rem 0;">
                <div style="font-size: 3rem; font-weight: 700; color: var(--accent); margin-bottom: 0.5rem;">
                    ${alignment.score}%
                </div>
                <div style="color: var(--text-secondary); font-size: 0.875rem;">
                    Alignment with <strong style="color: var(--text-primary);">${alignment.goal}</strong>
                </div>
            </div>
        `;
    },

    openAddModal: () => {
        document.getElementById('modal-title').innerText = 'Add Skill';
        document.getElementById('skill-id').value = '';
        document.getElementById('skill-name').value = '';
        document.getElementById('skill-proficiency').value = '';
        document.getElementById('skill-modal').classList.remove('hidden');
    },

    closeModal: () => {
        document.getElementById('skill-modal').classList.add('hidden');
    },

    handleFormSubmit: async (e) => {
        e.preventDefault();
        const btn = document.getElementById('skill-save-btn');
        btn.disabled = true;
        btn.innerText = 'Saving...';

        // skill-id holds the skill name (used to identify existing skills)
        const existingName = document.getElementById('skill-id').value;
        const name = document.getElementById('skill-name').value.trim();
        const proficiency = Number(document.getElementById('skill-proficiency').value);

        if (!name || isNaN(proficiency) || proficiency < 0 || proficiency > 100) {
            window.components.showToast('error', 'Please enter a valid skill name and proficiency (0-100).');
            btn.disabled = false;
            btn.innerText = 'Save';
            return;
        }

        try {
            if (existingName) {
                // Update existing skill — pass name as identifier
                await window.api.updateSkill(existingName, { proficiency });
            } else {
                await window.api.addSkill({ name, proficiency });
            }
            window.components.showToast('success', 'Skill saved successfully!');
            skillEngine.closeModal();
            await skillEngine.loadData(); // Refresh
        } catch (error) {
            window.components.showToast('error', 'Failed to save skill: ' + error.message);
        } finally {
            btn.disabled = false;
            btn.innerText = 'Save';
        }
    }
};

window.skillEngine = skillEngine;

document.addEventListener('DOMContentLoaded', skillEngine.init);
